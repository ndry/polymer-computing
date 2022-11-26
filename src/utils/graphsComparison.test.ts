import { getGraphRepresentationForEqualityComparison, GraphOfChainsDesc, normalizeDesc } from "./graphsComparison";

const fishGraph = [[
    { id: "head", sid: 1, },
    { sid: 2, },
    { sid: 3, },
    { sid: 2, },
    { sid: 3, },
    { sid: 2, },
    { ref: "head" },
], [
    { sid: 4 },
    { sid: 1, id: "tail" },
    { sid: 4 },
], [
    { ref: "head" },
    { ref: "tail" },
]];

const sameFishGraph1 = [[
    { id: "head", sid: 1, },
    { sid: 2, },
    { sid: 3, },
    { sid: 2, },
    { sid: 3, },
    { sid: 2, },
    { ref: "head" },
], [
    { ref: "tail" },
    { ref: "head" },
], [
    { sid: 4 },
    { sid: 1, id: "tail" },
    { sid: 4 },
]];

const sameFishGraph2 = [[
    { id: "head", sid: 2 },
    { sid: 3 },
    { sid: 2 },
    { id: "head-back", sid: 1 },
], [
    { ref: "head" },
    { sid: 3 },
    { sid: 2 },
    { ref: "head-back" },
], [
    { ref: "head-back" },
    { id: "tail", sid: 1 },
    { sid: 4 },
], [
    { ref: "tail" },
    { sid: 4 },
]];

const fishGraphButDifferent = [[
    { id: "head", sid: 1, },
    { sid: 2, },
    { sid: 3, },
    { sid: 4, },
    { sid: 3, },
    { sid: 2, },
    { ref: "head" }
], [
    { sid: 2 },
    { sid: 1, id: "tail" },
    { sid: 2 },
], [
    { ref: "head" },
    { ref: "tail" },
]];

const notFishGraph = [[
    { id: "head", sid: 1, },
    { sid: 2, },
    { sid: 3, },
    { sid: 4, },
    { sid: 3, },
    { sid: 2, },
    { ref: "head" }
], [
    { sid: 2 },
    { sid: 1, id: "tail" },
    { sid: 2 },
    { sid: 3 },
], [
    { ref: "head" },
    { sid: 1 },
    { ref: "tail" },
]];

type Node = { sid: number; };
function comapreNodes(upc1: Node, upc2: Node) {
    return upc1.sid - upc2.sid;
}

const eq = (g1: GraphOfChainsDesc<Node>, g2: GraphOfChainsDesc<Node>) =>
    JSON.stringify([...getGraphRepresentationForEqualityComparison(normalizeDesc(g1), comapreNodes)])
    === JSON.stringify([...getGraphRepresentationForEqualityComparison(normalizeDesc(g2), comapreNodes)]);

if (!eq(fishGraph, sameFishGraph1)) {
    throw "fishGraph vs sameFishGraph1 should be eq, but are not";
}
if (!eq(fishGraph, sameFishGraph2)) {
    throw "fishGraph vs sameFishGraph2 should be eq, but are not";
}
if (!eq(sameFishGraph1, sameFishGraph2)) {
    throw "sameFishGraph1 vs sameFishGraph2 should be eq, but are not";
}
if (eq(fishGraph, fishGraphButDifferent)) {
    throw "fishGraph vs fishGraphButDifferent should not be eq, but are";
}
if (eq(fishGraph, notFishGraph)) {
    throw "fishGraph vs notFishGraph should not be eq, but are";
}
if (eq(sameFishGraph1, fishGraphButDifferent)) {
    throw "sameFishGraph1 vs fishGraphButDifferent should not be eq, but are";
}
if (eq(sameFishGraph1, notFishGraph)) {
    throw "sameFishGraph1 vs notFishGraph should not be eq, but are";
}
if (eq(sameFishGraph2, fishGraphButDifferent)) {
    throw "sameFishGraph2 vs fishGraphButDifferent should not be eq, but are";
}
if (eq(sameFishGraph2, notFishGraph)) {
    throw "sameFishGraph2 vs notFishGraph should not be eq, but are";
}
if (eq(fishGraphButDifferent, notFishGraph)) {
    throw "fishGraphButDifferent vs notFishGraph should not be eq, but are";
}