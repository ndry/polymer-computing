import { apipe } from "./apipe";
import * as it from "./it";
import { tuple } from "./tuple";

type GraphOfChains<T> = {
    nodes: T[],
    chains: number[][],
}

export type NodeRefDesc = { ref: string };
export type NodeDesc<T> = T & { id?: string };
export type ChainDesc<T> = (NodeDesc<T> | NodeRefDesc)[];
export type GraphOfChainsDesc<T> = ChainDesc<T>[];

export function* normalizeDesc<T>(
    graph: GraphOfChainsDesc<T>, 
    cmp: (x1: T, x2: T) => number,
) {

    const nodes = graph.flatMap(chain => chain.filter((n): n is NodeDesc<T> => !("ref" in n)));
    const resolveNode = (n: NodeDesc<T> | NodeRefDesc) =>
        "ref" in n ? nodes.find(n1 => n1.id === n.ref)! : n;
    const getNodeIndex = (n: NodeDesc<T> | NodeRefDesc) =>
        nodes.indexOf(resolveNode(n));

    const links = apipe(graph,
        it.map(chain => apipe(chain,
            it.map(getNodeIndex),
            it.pairwise(),
        )),
        it.flat(),
        x => [...x],
    );

    type Link = [number, number];

    function* findAllPaths(pool: Link[], path: Link[] = []): Generator<Link[]> {
        let isDeadEnd = true;
        for (const link of pool) {
            const areLinked = (link1: Link, link2: Link) =>
                link1.some(n => link2.includes(n));

            if (path.length > 0 && !areLinked(path[path.length - 1], link)) {
                continue;
            }

            const poolWithoutLink = [...pool];
            poolWithoutLink.splice(poolWithoutLink.indexOf(link), 1);
            yield* findAllPaths(
                poolWithoutLink,
                [...path, link]
            );
            isDeadEnd = false;
        }
        if (isDeadEnd) {
            if (path.length > 0) {
                yield path;
            }
        }
    }

    const chainFromPath = (path: Link[]) => {
        if (path.length === 1) { return path[0]; }
        const chain = [] as number[];
        for (let i = 1; i < path.length; i++) {
            const [ln00, ln01] = path[i - 1];
            const [ln10, ln11] = path[i];

            // common node of l1 and l2
            const n2 = (ln00 === ln10) || (ln00 === ln11) ? ln00 : ln01;

            const n1 = (ln00 === n2) ? ln01 : ln00; // uncommon node of l1
            const n3 = (ln10 === n2) ? ln11 : ln10; // uncommon node of l2

            if (i === 1) { chain.push(n1); }
            chain.push(n2);
            if (i === path.length - 1) { chain.push(n3); }
        }
        return chain;
    };

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


        const paths = [...findAllPaths(links)].map(chainFromPath);
        paths.sort(cmpChains);
        const firstPaths = paths.filter(c => !cmpChains(c, paths[0]));
        for (const path of firstPaths) {
            const restLinks = links.filter(l => {
                for (let i = 1; i < path.length; i++) {
                    const n1 = path[i - 1];
                    const n2 = path[i];

                    const [l0, l1] = l;

                    if ((n1 === l0 && n2 === l1) || (n1 === l1 && n2 === l0)) {
                        return false;
                    }
                }
                return true;
            });
            if (restLinks.length === 0) {
                yield {
                    nodes,
                    chains,
                };
            } 
            yield* getSubgraphRepresentationForEqualityComparison(
                [...chains, path], restLinks);
        }
    }

    yield* getSubgraphRepresentationForEqualityComparison([], links);
}
