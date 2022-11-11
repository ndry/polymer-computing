import { Solution, Xrm, Upc, Link, XrmArm } from "./terms";


export function stepInPlace(
    s: Solution,
    step: number,
    world: {
        xrms: Xrm[];
        upi: Upc[];
    }
) {
    for (let j = 0; j < world.xrms.length; j++) {
        const xrm = world.xrms[j];
        const source = s.sources[j];
        const line = step < source.entryPoint.length
            ? source.entryPoint[step]
            : source.mainLoop[(step - source.entryPoint.length) % source.mainLoop.length];

        const command = line[0];

        const other = (link: Link, upc: Upc) => link[link[0] === upc ? 1 : 0];
        const atCircle = <T>(arr: T[], i: number) => {
            i = i % arr.length;
            if (i < 0) { i += arr.length; }
            return arr[i];
        };

        switch (command) {
            case "grab": {
                const [, armKey, brmKey, args] = line;
                const arm = xrm[armKey];
                const brm = xrm[brmKey];

                if (args) {
                    if (!brm.ox) { throw "not possible"; }
                    const d = args.d * brm.flip;
                    let base = 0;
                    if (args.rel) {
                        if (!brm.from) { throw "not possible"; }
                        base = brm.ox.links.indexOf(brm.from);
                    }
                    const link = atCircle(brm.ox.links, d + base);
                    arm.ox = other(link, brm.ox);
                    arm.from = link;
                } else {
                    arm.ox = brm.ox;
                    arm.from = brm.from;
                }
                break;
            }
            case "catch": {
                const [, armKey, sid] = line;
                const arm = xrm[armKey];

                const upc: Upc = {
                    sid,
                    links: [],
                };
                world.upi.push(upc);
                arm.ox = upc;
                arm.from = undefined;

                break;
            }
            case "loose": {
                const [, armKey] = line;
                const arm = xrm[armKey];
                arm.ox = undefined;
                arm.from = undefined;

                break;
            }
            case "link": {
                const arm = xrm[line[1]];
                const brm = xrm[line[2]];
                if (!arm.ox) { throw "not possible"; }
                if (arm.ox.links.length >= 3) { throw "not possible"; }
                if (!brm.ox) { throw "not possible"; }
                if (brm.ox.links.length >= 3) { throw "not possible"; }
                if (arm.ox === brm.ox) { throw "not possible"; }

                const existingLink = arm.ox.links.length > 0
                    && arm.ox.links.find(link => (link[0] === arm.ox && link[1] === brm.ox)
                        || (link[1] === arm.ox && link[0] === brm.ox));
                if (existingLink) { throw "not possible"; }

                const link = {
                    "0": arm.ox,
                    "1": brm.ox,
                };
                arm.ox.links.push(link);
                brm.ox.links.push(link);

                break;
            }
            case "unlink": {
                const arm = xrm[line[1]];
                const brm = xrm[line[2]];
                if (!arm.ox) { throw "not possible"; }
                if (!brm.ox) { throw "not possible"; }

                const link = arm.ox.links.find(link => (link[0] === arm.ox && link[1] === brm.ox)
                    || (link[1] === arm.ox && link[0] === brm.ox));

                if (!link) { throw "not possible"; }

                arm.ox.links.splice(arm.ox.links.indexOf(link), 1);
                brm.ox.links.splice(brm.ox.links.indexOf(link), 1);

                break;
            }
            case "noop": {
                break;
            }
        }
    }

    for (const xrm of world.xrms) {
        for (const arm of [xrm.arm, xrm.brm, xrm.crm]) {
            const linkBroken = arm.from && arm.ox.links.indexOf(arm.from) < 0;
            if (linkBroken) {
                (arm as XrmArm).from = undefined;
            }
        }
    }
}
