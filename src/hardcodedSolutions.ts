import { Solution } from "./puzzle/terms";

export const tetrahedron: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            ["grab", "brm", { sid: 1 }],
            ["grab", "crm", { sid: 2 }],
            ["link", "brm", "crm"],
            ["grab", "brm", { sid: 3 }],
            ["link", "brm", "crm"],
            ["grab", "crm", { brm: "crm", d: 0, rel: false }],
            ["link", "brm", "crm"],
            ["grab", "brm", { sid: 4 }],
            ["link", "brm", "crm"],
            ["grab", "crm", { brm: "crm", d: 0, rel: false }],
            ["link", "brm", "crm"],
            ["grab", "crm", { brm: "crm", d: 1, rel: false }],
            ["link", "brm", "crm"],
        ]
    }],
}

export const fishSolution: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            ["grab", "brm", { sid: 1 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { sid: 2 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { sid: 3 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { sid: 2 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { sid: 3 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { sid: 2 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "brm" }],
            ["grab", "brm", { brm: "crm", d: 0 }],
            ["unlink", "brm", "crm"],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "crm" }],
        ]
    }, {
        entryPoint: [
        ],
        mainLoop: [
            ["grab", "brm", { sid: 1 }],
            ["noop"],
            ["grab", "arm", { brm: "crm", d: 0 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { sid: 4 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { sid: 4 }],
            ["link", "arm", "brm"],
            ["grab", "arm", { brm: "crm" }],
            ["grab", "brm", { brm: "crm" }],
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