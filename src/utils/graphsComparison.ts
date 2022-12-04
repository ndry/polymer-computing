import { tuple } from "./tuple";
import { from, zip, first } from 'ix/iterable';
import { map, pairwise, flatMap } from 'ix/iterable/operators';
import { OperatorFunction } from "ix/interfaces";

function* findAllPaths(
    links: [number, number][],
    path: [number, ...number[]],
): Generator<number[], void, undefined> {
    const paths = [...from(links).pipe(
        flatMap(link => {
            if (!link.includes(path[0])) { return []; }
            const n = link[0] === path[0] ? link[1] : link[0];
            return findAllPaths(links.filter(l => l !== link), [n, ...path]);
        })
    )];

    if (paths.length > 0) {
        yield* paths;
    } else {
        yield path;
    }
}

export type NodeRefDesc = { ref: string };
export type NodeDesc<T> = T & { id?: string };
export type ChainDesc<T> = (NodeDesc<T> | NodeRefDesc)[];
export type GraphOfChainsDesc<T> = ChainDesc<T>[];

export function normalizeDesc<T>(
    graph: GraphOfChainsDesc<T>,
    cmp: (x1: T, x2: T) => number,
    struct: (x: T) => T,
) {
    type Link = [number, number];
    type GraphOfChains<T> = { nodes: T[], chains: number[][] }

    // destruct graph of chains into flat node list and flat links list
    const nodes = graph.flatMap(chain => chain.filter((n): n is NodeDesc<T> => !("ref" in n)));
    const links = [...from(graph).pipe(
        flatMap(chain => from(chain).pipe(
            map(n => "ref" in n
                ? nodes.findIndex(n1 => n1.id === n.ref)
                : nodes.indexOf(n)),
            pairwise() as OperatorFunction<number, [number, number]>,
        )),
    )];

    const cmpChains = (
        chains1: number[][], c1: number[],
        chains2: number[][], c2: number[],
    ) => {
        const asRef = (chains: number[][], id: number) => {
            const i = chains.findIndex(c => c.indexOf(id) >= 0);
            if (i < 0) { return undefined; }
            return tuple(i, chains[i].indexOf(id));
        }

        const comapreNodes = (id1: number, id2: number) => {
            const cmpRefs = (ref1: [number, number], ref2: [number, number]) =>
                (ref1[0] - ref2[0]) | (ref1[1] - ref2[1]);

            const ref1 = asRef(chains1, id1);
            const ref2 = asRef(chains2, id2);
            return ref1
                ? (ref2 ? cmpRefs(ref1, ref2) : +Infinity)
                : (ref2 ? -Infinity : cmp(nodes[id1], nodes[id2]));
        };

        return (c2.length - c1.length)
            || (c1.filter(n => asRef(chains1, n)).length - c2.filter(n => asRef(chains2, n)).length)
            || (first(zip(c1, c2).pipe(map(([n1, n2]) => comapreNodes(n1, n2)))) ?? 0);
    };

    function* findBestRepresentations(
        chains: number[][],
        links: Link[],
    ): Generator<GraphOfChains<T>> {
        // todo: very similar to findAllPaths, can be generalized

        const _cmpChains = (c1: number[], c2: number[]) => cmpChains(chains, c1, chains, c2);

        const paths = nodes
            .flatMap((_, i) => [...findAllPaths(links, [i])].filter(p => p.length > 1));
        paths.sort(_cmpChains);
        const firstPaths = paths.filter(c => !_cmpChains(c, paths[0]));
        for (const path of firstPaths) {
            const restLinks = links.filter(l => {
                for (let i = 1; i < path.length; i++) {
                    if (l.includes(path[i - 1]) && l.includes(path[i])) {
                        return false;
                    }
                }
                return true;
            });
            if (restLinks.length === 0) {
                yield { nodes, chains: [...chains, path] };
            }
            yield* findBestRepresentations(
                [...chains, path], restLinks);
        }
    }

    const results = [...findBestRepresentations([], links)].map(r => {
        const _nodes = [] as T[];
        for (const chain of r.chains) {
            for (const node of chain) {
                if (_nodes.indexOf(nodes[node]) < 0) {
                    _nodes.push(nodes[node]);
                }
            }
        }
        return ({
            nodes: _nodes.map(struct),
            chains: r.chains.map(c => c.map(id => _nodes.indexOf(nodes[id]))),
        });
    });

    results.sort((g1: GraphOfChains<T>, g2: GraphOfChains<T>) =>
        (g2.chains.length - g1.chains.length)
        || (first(zip(g1.nodes, g2.nodes).pipe(map(([n1, n2]) =>
            cmp(n1, n2)))
        ) ?? 0)
        || (first(zip(g1.chains, g2.chains).pipe(map(([c1, c2], i) =>
            cmpChains(g1.chains.slice(0, i), c1, g2.chains.slice(0, i), c2)))
        ) ?? 0));

    return results[0];
}
