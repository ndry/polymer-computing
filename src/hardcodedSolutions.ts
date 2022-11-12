import { Solution } from "./puzzle/terms";

export const shortTestSolution: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [],
        mainLoop: [
            ["catch", "brm", 1],
            ["catch", "crm", 2],
            ["link", "brm", "crm"],
        ],
    }]
}

export const tetrahedron: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            ["catch", "brm", 1],
            ["catch", "crm", 2],
            ["link", "brm", "crm"],
            ["catch", "brm", 3],
            ["link", "brm", "crm"],
            ["grab", "crm", "crm", { d: 0, rel: false }],
            ["link", "brm", "crm"],
            ["catch", "brm", 4],
            ["link", "brm", "crm"],
            ["grab", "crm", "crm", { d: 0, rel: false }],
            ["link", "brm", "crm"],
            ["grab", "crm", "crm", { d: 1, rel: false }],
            ["link", "brm", "crm"],
        ]
    }],
}

export const newTetrahedron: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            ["catch", "brm", 1],
            ["catch", "crm", 2],
            ["link", "brm", "crm"],
            ["link", "brm", "arm"],
            ["link", "arm", "crm"],
            ["catch", "brm", 4],
            ["link", "arm", "crm"],
            ["link", "arm", "brm"],
            ["grab", "crm", "crm", { d: 1, rel: false }],
            ["link", "arm", "crm"],
            ["catch", "brm", 0],
        ]
    }],
}

export const fishSolution: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            ["catch", "brm", 1],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["catch", "brm", 2],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["catch", "brm", 3],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["catch", "brm", 2],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["catch", "brm", 3],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["catch", "brm", 2],
            ["link", "arm", "brm"],
            ["grab", "arm", "brm"],
            ["grab", "brm", "crm", { d: 0 }],
            ["unlink", "brm", "crm"],
            ["link", "arm", "brm"],
            ["grab", "arm", "crm"],
        ]
    }, {
        entryPoint: [
        ],
        mainLoop: [
            ["catch", "brm", 1],
            ["noop"],
            ["grab", "arm", "crm", { d: 0 }],
            ["link", "arm", "brm"],
            ["catch", "arm", 4],
            ["link", "arm", "brm"],
            ["catch", "arm", 4],
            ["link", "arm", "brm"],
            ["grab", "arm", "crm"],
            ["grab", "brm", "crm"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
            ["noop"],
        ]
    }],
}