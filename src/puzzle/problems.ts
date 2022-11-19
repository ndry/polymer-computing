import { Problem } from "./terms";

export const fishProblem: Problem = {
    targets: [{
        count: 20,
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
    }],
};