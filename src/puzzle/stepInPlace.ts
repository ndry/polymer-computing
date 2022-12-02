import { Solution, Xrm, Upc, Link, XrmArm } from "./terms";

import { normalizeDesc } from "../utils/graphsComparison";

export function stepInPlace(
    s: Solution,
    step: number,
    world: {
        xrms: (Xrm | undefined)[];
        upi: Upc[];
        unlinkedUpi: Upc[];
        targetsSoved: number;
    }
) {
    for (let j = 0; j < world.xrms.length; j++) {
        const xrm = world.xrms[j];
        if (!xrm) { continue; }
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
        if (!xrm) { continue; }
        for (const arm of [xrm.arm, xrm.brm, xrm.crm]) {
            const linkBroken = arm.from && arm.ox.links.indexOf(arm.from) < 0;
            if (linkBroken) {
                (arm as XrmArm).from = undefined;
            }
        }
    }

    const linked = [...new Set(
        world.xrms
            .filter(xrm => xrm)
            .flatMap(xrm => allLinkedToXrm(world.upi, xrm!)))];
    const unlinked = world.upi.filter(u => !linked.includes(u));
    world.unlinkedUpi.push(...unlinked);
    world.upi = linked;

    while (unlinked.length > 0) {
        const l1 = [...allLinked(unlinked, unlinked[0])];
        for (const u of l1) {
            unlinked.splice(unlinked.indexOf(u), 1);
        }

        const nodes = l1.map((u, i) => ([{
            id: "_" + i,
            sid: u.sid,
        }]));
        const links = [...new Set(l1.flatMap(u => u.links))]
            .map(l => [{ ref: "_" + l1.indexOf(l[0]) }, { ref: "_" + l1.indexOf(l[1]) }]);

        const graphDesc = [...nodes, ...links];
        const comapreNodes = (upc1: { sid: number }, upc2: { sid: number }) => upc1.sid - upc2.sid;
        const structNode = ({ sid }: { sid: number }) => ({ sid });

        const n1 = normalizeDesc(graphDesc, comapreNodes, structNode);
        const n2 = normalizeDesc(s.problem.targets[0].structure, comapreNodes, structNode);
        const eq = JSON.stringify(n1) === JSON.stringify(n2);

        if (eq) {
            world.targetsSoved++;
        }
    }

}

const allLinkedToXrm = (upi: Upc[], xrm: Xrm) =>
    [xrm.arm.ox, xrm.brm.ox, xrm.crm.ox]
        .filter(u => u)
        .flatMap(u => [...allLinked(upi, u!)]);

const allLinked = (upi: Upc[], upc: Upc) => {
    const visited = new Set<Upc>();
    const queue = [upc];

    const tryVsit = (u: Upc) => {
        if (visited.has(u)) { return; }
        visited.add(u);
        queue.push(...u.links.map(link => link[u === link[0] ? 1 : 0]));
    }

    while (queue.length > 0) {
        tryVsit(queue.shift()!);
    }

    return visited;
}