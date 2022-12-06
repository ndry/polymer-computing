import { Problem } from "./terms";

export const fishProblem: Problem = {
    targets: [{
        count: 10,
        structure: [[
            { id: "head", sid: 1, },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { ref: "head" }
        ], [
            { sid: 4 },
            { sid: 1, id: "tail" },
            { sid: 4 },
        ], [
            { ref: "head" },
            { ref: "tail" },
        ]],
    }, {
        count: 10,
        structure: [[
            { sid: 4, },
            { sid: 1, id: "tail" },
            { sid: 1, id: "head" },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { ref: "head" }
        ], [
            { sid: 4, },
            { ref: "tail" },
        ]],
    }, {
        count: 10,
        structure: [[
            { sid: 1, id: "head" },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { sid: 3, },
            { sid: 2, },
            { ref: "head" }
        ], [
            { ref: "head" },
            { sid: 1, id: "tail" },
            { sid: 4 },
        ], [
            { ref: "tail" },
            { sid: 4 }
        ]],
    },],
};

export const oneTwoProblem: Problem = {
    targets: [{
        count: 100,
        structure: [[
            { sid: 1, },
            { sid: 2, },
        ]],
    }, {
        count: 100,
        structure: [[
            { sid: 2, },
            { sid: 1, },
        ]],
    }],
};