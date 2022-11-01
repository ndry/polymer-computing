import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useEffect, useMemo, useRef } from "preact/hooks";
import { appVersion } from "./appVersion";
import { atom, useRecoilValue } from "recoil";
import update, { Spec } from "immutability-helper";
import { Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, Sphere, SphereGeometry, Vector3, WebGLRenderer } from "three";

export type SubstanceId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type XrmArmKey = "arm" | "brm" | "crm";

export type XrmAction = {
    action: "grab",
    subject: XrmArmKey,
    object: {
        s: SubstanceId
    } | {
        arm: XrmArmKey,
        d: `${"n" | "o" | "u"}x`,
    } | undefined,
} | {
    action: "link",
    subject1: XrmArmKey,
    subject2: XrmArmKey,
} | {
    action: "unlink",
    subject1: XrmArmKey,
    subject2: XrmArmKey,
} | {
    action: "rotate",
    subject: XrmArmKey,
} | {
    action: "noop",
}

export type Xrm = {
    arm: {
        ox: Upc | undefined,
        d: -1 | 1,
    },
    brm: Xrm["arm"],
    crm: Xrm["arm"],
}

export type Upc = {
    sid: number,
    nx: Upc | undefined,
    ux: Upc | undefined,
}

export type Solution = {
    problem: undefined,
    sources: Array<{
        entryPoint: XrmAction[],
        mainLoop: XrmAction[],
    }>,
}


const s: Solution = {
    problem: undefined,
    sources: [{
        entryPoint: [
        ],
        mainLoop: [
            { action: "grab", subject: "brm", object: { s: 1 } },
            { action: "link", subject1: "arm", subject2: "brm" },
            { action: "grab", subject: "arm", object: { arm: "brm", d: "ox" } },
        ]
    }],
}

export type World = {
    time: number,
    xrms: Xrm[],
    upi: Record<string, Upc>,
}

// export function step(world: World) {
//     let nextWorld = update(world, { time: { $set: world.time + 1 } });
//     const t = world.time % (Math.max(...world.xrms.map(x => x.code.length)));
//     for (let i = 0; i < world.xrms.length; i++) {
//         const xrm = world.xrms[i];
//         const action = xrm.code[t];
//         if (!action) { continue; }
//         nextWorld = update(nextWorld, ((): Spec<World> => {
//             switch (action.action) {
//                 case "grab": {
//                     return { 
//                         xrms: {
//                             i: {
//                                 [action.subject]: {
//                                     ox: {
//                                         $set: {
//                                             x: xrm[action.object],
//                                         }
//                                     }
//                                 } as Spec<Xrm[XrmArmKey]>,
//                             }
//                         }
//                     }
//                 }
//             }
//         })());
//     }
// }

export const worldRecoil = atom({
    key: "world",
    default: {
        time: 0,
        xrms: [],
        upi: {},
    } as World
})

export const landscapeWidth = 922;

export function App() {
    // const world = useRecoilValue(worldRecoil);
    const version = <div>
        <span className={css({ fontSize: "16px", })} >{appVersion.split("+")[0]}</span>
        <span className={css({ fontSize: "10px", })} >+{appVersion.split("+")[1]}</span>
    </div>;

    const initialUpc: Upc = {
        sid: 0,
        nx: undefined,
        ux: undefined,
    }
    let world = {
        xrms: s.sources.map(() => ({
            arm: {
                ox: initialUpc,
                d: 1,
            },
            brm: {
                ox: undefined,
                d: 1,
            },
            crm: {
                ox: undefined,
                d: 1,
            },
        } as Xrm)),
        upi: [initialUpc] as Upc[]
    };
    const worldSnapshots = [] as any[];
    for (let i = 0; i < 10; i++) {
        worldSnapshots.push(<div>
            {i}<br />
            xrms: {world.xrms.map(xrm => JSON.stringify({
                arm: {
                    ox: xrm.arm.ox ? world.upi.indexOf(xrm.arm.ox) : '-',
                    d: xrm.arm.d,
                },
                brm: {
                    ox: xrm.brm.ox ? world.upi.indexOf(xrm.brm.ox) : '-',
                    d: xrm.brm.d,
                },
                crm: {
                    ox: xrm.crm.ox ? world.upi.indexOf(xrm.crm.ox) : '-',
                    d: xrm.crm.d,
                },
            }))}<br />
            upi: {world.upi.map(upc => JSON.stringify({
                sid: upc.sid,
                nx: upc.nx ? world.upi.indexOf(upc.nx) : '-',
                ux: upc.ux ? world.upi.indexOf(upc.ux) : '-',
            }))}<br />
        </div>);
        for (let j = 0; j < world.xrms.length; j++) {
            const xrm = world.xrms[j];
            const source = s.sources[j];
            const action =
                i < source.entryPoint.length
                    ? source.entryPoint[i]
                    : source.mainLoop[(i - source.entryPoint.length) % source.mainLoop.length];
            switch (action.action) {
                case "grab": {
                    const arm = xrm[action.subject];
                    if (action.object === undefined) {
                        arm.ox = undefined;
                    } else if ("s" in action.object) {
                        const upc: Upc = {
                            sid: action.object.s,
                            nx: undefined,
                            ux: undefined,
                        };
                        world.upi.push(upc);
                        arm.ox = upc;
                    } else {
                        switch (action.object.d) {
                            case "ox": {
                                arm.ox = xrm[action.object.arm].ox;
                                break;
                            }
                            default:
                                throw "not implemeted";
                        }
                    }
                    break;
                }
                case "link": {
                    const arm = xrm[action.subject1];
                    const brm = xrm[action.subject2];
                    if (arm.ox && brm.ox) {
                        arm.ox.nx = brm.ox;
                        brm.ox.ux = arm.ox;
                    }
                }
                case "noop": {
                    break;
                }
                default:
                    throw "not implemeted";
            }
        }
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) { return; }
        const renderer = new WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });

        const scene = new Scene();

        class Ball extends Mesh {
            constructor() {
                super(
                    new SphereGeometry(),
                    new MeshNormalMaterial());
            }
            
            mass = 1;
            aggregatedForce = new Vector3(0, 0, 0);
            velocity = new Vector3(0, 0, 0);
        }

        const balls = Array.from({ length: 5 }, (_, i) => {
            const ball = new Ball;
            ball.position.set(i, Math.sqrt(i), 0);
            return ball;
        });
        scene.add(...balls);

        const aspect = renderer.domElement.width / renderer.domElement.height;
        const camera = new PerspectiveCamera(70, aspect, 0.01, 10);
        camera.position.z = 10;

        const gravity = new Vector3(0, -9.81, 0);

        const vs = [
            new Vector3(),
            new Vector3(),
        ] as const;

        let lastTimeMs = performance.now();
        const tick = (timeMs: number) => {
            handler = requestAnimationFrame(tick);
            const dt = (timeMs - lastTimeMs) / 1000;
            
            for (const ball of balls) {
                ball.aggregatedForce.setScalar(0);
            }
            for (const ball of balls) {
                // ball.aggregatedForce.addScaledVector(gravity, ball.mass);
                for (const b of balls) {
                    if (b === ball) { continue; }
                    const d = vs[0];
                    d.copy(b.position);
                    d.sub(ball.position);
                    const r = d.length();
                    const f = vs[1];
                    f.copy(d);
                    f.multiplyScalar(ball.mass * b.mass / (r * r * r));
                    ball.aggregatedForce.add(f);
                    f.copy(d);
                    f.multiplyScalar(-ball.mass * b.mass / (r * r * r * r));
                    ball.aggregatedForce.add(f);
                }
            }
            for (const ball of balls) {
                ball.velocity.addScaledVector(ball.aggregatedForce, dt / ball.mass);
                ball.velocity.clampLength(0, 1000);
                ball.position.addScaledVector(ball.velocity, dt);
            }
            
            renderer.render( scene, camera );
            lastTimeMs = timeMs;
        };
        let handler = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(handler);
    }, [canvasRef.current]);

    return <div className={cx(
        css`& {
            font-family: 'Bahnschrift', sans-serif;
            display: flex;
            position: fixed;
            inset: 0;
            overflow: auto;
        }
        `,
        css`&::-webkit-scrollbar { height: 0px; }`
    )}>
        <div className={cx(css`& {
            flex-grow: 1;
            max-width: ${landscapeWidth}px;
            position: relative;
            margin: auto;
        }`)}>
            <canvas ref={canvasRef} width="500" height="300"></canvas>
            {s.sources.map((source, i) => <div>
                <div>xrm #{i}:</div>
                <code>
                    entry point:<br />
                    {source.entryPoint.map((line, i) => <>
                        {i.toString().padStart(2, "0")}| {JSON.stringify(line)}<br />
                    </>)}
                    main loop:<br />
                    {source.mainLoop.map((line, i) => <>
                        {i.toString().padStart(2, "0")}| {JSON.stringify(line)}<br />
                    </>)}
                </code>
            </div>)}
            {worldSnapshots.map(s => <div>{s}</div>)}
            {version}
        </div>
    </div>
}
