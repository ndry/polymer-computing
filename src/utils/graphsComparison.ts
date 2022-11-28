import { indexOf } from "lodash";
import { apipe } from "./apipe";
import * as it from "./it";
import { tuple } from "./tuple";

function* findAllPaths(
    links: [number, number][],
    path: [number, ...number[]],
): Generator<number[], void, undefined> {
    const paths = apipe(links,
        it.map(link => {
            if (!link.includes(path[0])) { return []; }
            const n = link[0] === path[0] ? link[1] : link[0];
            return findAllPaths(links.filter(l => l !== link), [n, ...path]);
        }),
        it.flat(),
        x => [...x],
    );

    if (paths.length > 0) {
        yield* paths;
    } else {
        yield path;
    }
}


type GraphOfChains<T> = {
    nodes: T[],
    chains: number[][],
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

    const nodes = graph.flatMap(chain => chain.filter((n): n is NodeDesc<T> => !("ref" in n)));
    const resolveNode = (n: NodeDesc<T> | NodeRefDesc) =>
        "ref" in n ? nodes.find(n1 => n1.id === n.ref)! : n;
    const getNodeIndex = (n: NodeDesc<T> | NodeRefDesc) =>
        nodes.indexOf(resolveNode(n));

    type Link = [number, number];
    const links = apipe(graph,
        it.map(chain => apipe(chain,
            it.map(getNodeIndex),
            it.pairwise(),
        )),
        it.flat(),
        x => [...x],
    );

    function* getSubgraphRepresentationForEqualityComparison(
        chains: number[][],
        links: Link[],
    ): Generator<GraphOfChains<T>> {

        const cmpChains = (() => {
            const asRef = (id: number) => {
                const i = chains.findIndex(c => c.indexOf(id) >= 0);
                if (i < 0) { return undefined; }
                return tuple(i, chains[i].indexOf(id));
            }

            const cmpRefs = (id1: number, id2: number) => {
                const ref1 = asRef(id1)!;
                const ref2 = asRef(id2)!;
                return (ref1[0] - ref2[0]) | (ref1[1] - ref2[1]);
            };

            const comapreNodes = (id1: number, id2: number) =>
                asRef(id1)
                    ? (asRef(id2) ? cmpRefs(id1, id2) : +Infinity)
                    : (asRef(id2) ? -Infinity : cmp(nodes[id1], nodes[id2]));

            return (c1: number[], c2: number[]) => (c2.length - c1.length)
                || (c1.filter(asRef).length - c2.filter(asRef).length)
                || (() => {
                    for (let i = 0; i < c1.length; i++) {
                        const d = comapreNodes(c1[i], c2[i]);
                        if (d) { return d; }
                    }
                    return 0;
                })();
        })();


        const paths = nodes
            .flatMap((_, i) => [...findAllPaths(links, [i])].filter(p => p.length > 1));
        paths.sort(cmpChains);
        const firstPaths = paths.filter(c => !cmpChains(c, paths[0]));
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
                yield {
                    nodes,
                    chains: [...chains, path],
                };
            }
            yield* getSubgraphRepresentationForEqualityComparison(
                [...chains, path], restLinks);
        }
    }

    const cmpGraphs = (() => {
        const asRef = (chains: number[][], id: number) => {
            const i = chains.findIndex(c => c.indexOf(id) >= 0);
            if (i < 0) { return undefined; }
            return tuple(i, chains[i].indexOf(id));
        }

        const cmpRefs = (
            chains1: number[][], id1: number,
            chains2: number[][], id2: number,
        ) => {
            const ref1 = asRef(chains1, id1)!;
            const ref2 = asRef(chains2, id2)!;
            return (ref1[0] - ref2[0]) | (ref1[1] - ref2[1]);
        };

        const comapreNodes = (
            chains1: number[][], id1: number,
            chains2: number[][], id2: number,
        ) => asRef(chains1, id1)
                ? (asRef(chains2, id2) ? cmpRefs(chains1, id1, chains2, id2) : +Infinity)
                : (asRef(chains2, id2) ? -Infinity : cmp(nodes[id1], nodes[id2]));


        const cmpChains = (
            chains1: number[][],
            c1: number[],
            chains2: number[][],
            c2: number[],
        ) => (c2.length - c1.length)
        || (c1.filter(n => asRef(chains1, n)).length - c2.filter(n => asRef(chains2, n)).length)
            || (() => {
                for (let i = 0; i < c1.length; i++) {
                    const d = comapreNodes(chains1, c1[i], chains2, c2[i]);
                    if (d) { return d; }
                }
                return 0;
            })();


        return (g1: GraphOfChains<T>, g2: GraphOfChains<T>) =>
            (g2.chains.length - g1.chains.length)
            || (() => {
                for (let i = 0; i < g1.nodes.length; i++) {
                    const d = cmp(g1.nodes[i], g2.nodes[i]);
                    if (d) { return d; }
                }
                return 0;
            })()
            || (() => {
                for (let i = 0; i < g1.chains.length; i++) {
                    const d = cmpChains(
                        g1.chains.slice(0, i),
                        g1.chains[i], 
                        g2.chains.slice(0, i),
                        g2.chains[i], 
                    );
                    if (d) { return d; }
                }
                return 0;
            })();
    })()

    const results = [...getSubgraphRepresentationForEqualityComparison([], links)]
        .map(r => {
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
        })
    results.sort(cmpGraphs);
    return results[0];
}
