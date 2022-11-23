
export type NodeDesc<T> = (T & ({} | { id: string })) | { ref: string };
export type ChainDesc<T> = NodeDesc<T>[];
export type GraphOfChainsDesc<T> = ChainDesc<T>[];

type Id = [number, number];
type Node<T> = T | { ref: Id };
type Chain<T> = Node<T>[];
type GraphOfChains<T> = Chain<T>[];
type Link = [Id, Id];

type CompareFn<T> = (x1: T, x2: T) => number;

const isRefNode = <T>(n: Node<T>): n is { ref: Id } => {
    return typeof n === "object" && n !== null && "ref" in n;
}

function comapreNodes<T>(n1: Node<T>, n2: Node<T>, cmp: CompareFn<T>) {
    if (isRefNode(n1)) {
        if (isRefNode(n2)) {
            return (n1.ref[0] - n2.ref[0]) || (n1.ref[1] - n2.ref[1]);
        }
        return Infinity;
    }
    if (isRefNode(n2)) {
        return -Infinity;
    }
    return cmp(n1, n2);
}

const compareChains = <T>(cmp: CompareFn<T>) =>
    (c1: Chain<T>, c2: Chain<T>) =>
        (c2.length - c1.length)
        || (c1.filter(isRefNode).length - c2.filter(isRefNode).length)
        || (() => {
            for (let i = 0; i < c1.length; i++) {
                const d = comapreNodes(c1[i], c2[i], cmp);
                if (d) { return d; }
            }
            return 0;
        })()

export function normalizeDesc<T>(graph: GraphOfChainsDesc<T>) {
    const idMap = {} as Record<string, [number, number]>;
    for (let i = 0; i < graph.length; i++) {
        const chain = graph[i];
        for (let j = 0; j < chain.length; j++) {
            const n = chain[j];
            if (typeof n === "object" && n !== null && "id" in n) {
                idMap[n.id] = [i, j];
            }
        }
    }
    return graph.map(chain =>
        chain.map(n =>
            (typeof n === "object" && n !== null && "ref" in n)
                ? { ref: idMap[n.ref] }
                : n));
}

function* listLinks<T>(graph: GraphOfChains<T>) {
    for (let i = 0; i < graph.length; i++) {
        const chain = graph[i];
        let prevNodeId;
        for (let j = 0; j < chain.length; j++) {
            const node = chain[j];
            const id = isRefNode(node) ? node.ref : [i, j];
            if (prevNodeId) {
                yield [prevNodeId, id] as [Id, Id];
            }
            prevNodeId = id;
        }
    }
}

const areLinksLinked = (link1: Link, link2: Link) =>
    link1.some(n => link2.includes(n));

function* findAllPaths<T>(pool: Link[], path: Link[] = []): Generator<Link[]> {
    let isDeadEnd = true;
    for (const link of pool) {
        if (path.length > 0 && !areLinksLinked(path[path.length - 1], link)) {
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
        yield path;
    }
}

const chainFromPath = <T>(graph: GraphOfChains<T>) =>
    (path: Link[]): Chain<T> => { throw "not implemented"; };

function* getSubgraphRepresentationForEqualityComparison<T>(
    graph: GraphOfChains<T>, 
    cmp: CompareFn<T>, 
    links: Link[],
): Generator<GraphOfChains<T>> {
    const paths = [...findAllPaths(links)].map(chainFromPath(graph));
    paths.sort(compareChains(cmp));
    const firstPaths = paths.filter(c => !compareChains(cmp)(c, paths[0]));
    for (const firstPath of firstPaths) {
        const restLinks = links.filter(l => { 
            // get restLinks by filtering out links of firstPath
            throw "not implemented"; 
        });
        yield* getSubgraphRepresentationForEqualityComparison(graph, cmp, restLinks);
    }
}

export function* getGraphRepresentationForEqualityComparison<T>(graph: GraphOfChains<T>, cmp: CompareFn<T>) {
    const links = [...listLinks(graph)];
    yield* getSubgraphRepresentationForEqualityComparison(graph, cmp, links);
}
