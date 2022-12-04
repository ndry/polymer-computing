import { normalizeDesc, GraphOfChainsDesc } from "./graphsComparison";

const fishGraph = [[
    { id: "head", x: 1, },
    { x: 2, },
    { x: 3, },
    { x: 2, },
    { x: 3, },
    { x: 2, },
    { ref: "head" },
], [
    { x: 4 },
    { x: 1, id: "tail" },
    { x: 4 },
], [
    { ref: "head" },
    { ref: "tail" },
]];

const sameFishGraph1 = [[
    { id: "head", x: 1, },
    { x: 2, },
    { x: 3, },
    { x: 2, },
    { x: 3, },
    { x: 2, },
    { ref: "head" },
], [
    { ref: "tail" },
    { ref: "head" },
], [
    { x: 4 },
    { x: 1, id: "tail" },
    { x: 4 },
]];

const sameFishGraph2 = [[
    { id: "head", x: 2 },
    { x: 3 },
    { x: 2 },
    { id: "head-back", x: 1 },
], [
    { ref: "head" },
    { x: 3 },
    { x: 2 },
    { ref: "head-back" },
], [
    { ref: "head-back" },
    { id: "tail", x: 1 },
    { x: 4 },
], [
    { ref: "tail" },
    { x: 4 },
]];

const fishGraphButDifferent = [[
    { id: "head", x: 1, },
    { x: 2, },
    { x: 3, },
    { x: 4, },
    { x: 3, },
    { x: 2, },
    { ref: "head" }
], [
    { x: 2 },
    { x: 1, id: "tail" },
    { x: 2 },
], [
    { ref: "head" },
    { ref: "tail" },
]];

const notFishGraph = [[
    { id: "head", x: 1, },
    { x: 2, },
    { x: 3, },
    { x: 4, },
    { x: 3, },
    { x: 2, },
    { ref: "head" }
], [
    { x: 2 },
    { x: 1, id: "tail" },
    { x: 2 },
    { x: 3 },
], [
    { ref: "head" },
    { x: 1 },
    { ref: "tail" },
]];

type Node = { x: number; };
const comapreNodes = (upc1: Node, upc2: Node) => upc1.x - upc2.x;
const structNode = ({ x }: Node) => ({ x });

const eq = (g1: GraphOfChainsDesc<Node>, g2: GraphOfChainsDesc<Node>) =>
    JSON.stringify(normalizeDesc(g1, comapreNodes, structNode))
    === JSON.stringify(normalizeDesc(g2, comapreNodes, structNode));

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