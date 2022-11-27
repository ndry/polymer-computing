import { normalizeDesc, GraphOfChainsDesc } from "./graphsComparison";

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
    JSON.stringify([...normalizeDesc(g1, comapreNodes)])
    === JSON.stringify([...normalizeDesc(g2, comapreNodes)]);

console.log(JSON.stringify([...normalizeDesc(fishGraph as GraphOfChainsDesc<Node>, comapreNodes)], undefined, 4))

if (!eq(fishGraph, sameFishGraph1)) {
    console.error("xx: fishGraph vs sameFishGraph1 should be eq, but are not");
} else {
    console.log("ok: fishGraph vs sameFishGraph1 should be eq");
}
if (!eq(fishGraph, sameFishGraph2)) {
    console.error("xx: fishGraph vs sameFishGraph2 should be eq, but are not");
} else {
    console.log("ok: fishGraph vs sameFishGraph2 should be eq");
}
if (!eq(sameFishGraph1, sameFishGraph2)) {
    console.error("xx: sameFishGraph1 vs sameFishGraph2 should be eq, but are not");
} else {
    console.log("ok: sameFishGraph1 vs sameFishGraph2 should be eq");
}
if (eq(fishGraph, fishGraphButDifferent)) {
    console.error("xx: fishGraph vs fishGraphButDifferent should not be eq, but are");
} else {
    console.log("ok: fishGraph vs fishGraphButDifferent should not be eq");
}
if (eq(fishGraph, notFishGraph)) {
    console.error("xx: fishGraph vs notFishGraph should not be eq, but are");
} else {
    console.log("ok: fishGraph vs notFishGraph should not be eq");
}
if (eq(sameFishGraph1, fishGraphButDifferent)) {
    console.error("xx: sameFishGraph1 vs fishGraphButDifferent should not be eq, but are");
} else {
    console.log("ok: sameFishGraph1 vs fishGraphButDifferent should not be eq");
}
if (eq(sameFishGraph1, notFishGraph)) {
    console.error("xx: sameFishGraph1 vs notFishGraph should not be eq, but are");
} else {
    console.log("ok: sameFishGraph1 vs notFishGraph should not be eq");
}
if (eq(sameFishGraph2, fishGraphButDifferent)) {
    console.error("xx: sameFishGraph2 vs fishGraphButDifferent should not be eq, but are");
} else {
    console.log("ok: sameFishGraph2 vs fishGraphButDifferent should not be eq");
}
if (eq(sameFishGraph2, notFishGraph)) {
    console.error("xx: sameFishGraph2 vs notFishGraph should not be eq, but are");
} else {
    console.log("ok: sameFishGraph2 vs notFishGraph should not be eq");
}
if (eq(fishGraphButDifferent, notFishGraph)) {
    console.error("xx: fishGraphButDifferent vs notFishGraph should not be eq, but are");
} else {
    console.log("ok: fishGraphButDifferent vs notFishGraph should not be eq");
}