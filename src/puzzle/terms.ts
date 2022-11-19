export type SubstanceId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type XrmArmKey = "arm" | "brm" | "crm";

export type XrmCommand =
    ["grab", XrmArmKey, XrmArmKey, { d: number, rel?: boolean }?]
    | ["catch", XrmArmKey, SubstanceId]
    | ["loose", XrmArmKey]
    // | ["rotate", XrmArmKey, number]
    // | ["flip", XrmArmKey, number]
    | ["link", XrmArmKey, XrmArmKey]
    | ["unlink", XrmArmKey, XrmArmKey]
    | ["noop"];

export type Link = {
    0: Upc,
    1: Upc,
};

export type XrmArm = {
    flip: -1 | 1,
} & ({
    ox: Upc,
    from: Link,
} | {
    ox: Upc | undefined,
    from: undefined,
})
export type Xrm = {
    arm: XrmArm,
    brm: XrmArm,
    crm: XrmArm,
}

export type Upc = {
    sid: number,
    links: Link[],
}

export type ProblemTargetStructureNode =
    { id?: string, sid: SubstanceId }
    | { ref: string };
    
export type Problem = {
    targets: Array<{
        count: number,
        structure: Array<[
            ProblemTargetStructureNode,
            ...ProblemTargetStructureNode[]]>,
    }>;
}

export type Solution = {
    problem: undefined,
    sources: Array<{
        entryPoint: XrmCommand[],
        mainLoop: XrmCommand[],
    }>,
}

export type World = {
    xrms: (Xrm | undefined)[];
    upi: Upc[];
}

export const initialWorld = (s: Solution) => {
    const initialUpc: Upc = {
        sid: 0,
        links: [],
    };
    return ({
        xrms: s.sources.map(s => {
            if (s.mainLoop.every(c => c[0] === "noop")) {
                return undefined;
            }
            return ({
                arm: {
                    ox: initialUpc,
                    from: undefined,
                    flip: 1,
                },
                brm: {
                    ox: initialUpc,
                    from: undefined,
                    flip: 1,
                },
                crm: {
                    ox: initialUpc,
                    from: undefined,
                    flip: 1,
                },
            } as Xrm);
        }),
        upi: [initialUpc] as Upc[]
    });
}