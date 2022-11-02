import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { appVersion } from "./appVersion";
import { atom, useRecoilValue } from "recoil";
import update, { Spec } from "immutability-helper";
import {
    Vector3,
    WebGLRenderer, PerspectiveCamera, Scene,
    Mesh,
    MeshPhongMaterial,
    SphereGeometry,
    Material,
    DirectionalLight,
    AmbientLight,
    Color,
    BufferGeometry,
    CylinderGeometry,
    IcosahedronGeometry,
    Group,
    Object3D,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { substanceColors } from "./substanceColors";
import { mixAddTap } from "./utils/mixAddTap";
import memoizee from "memoizee";
import { mixBody, PhysicsBody, PhysicsLink, physicsTick } from "./physics";

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
            { action: "grab", subject: "brm", object: { s: 1 } },
            { action: "link", subject1: "arm", subject2: "brm" },
            { action: "grab", subject: "arm", object: { arm: "brm", d: "ox" } },
        ]
    }, {
        entryPoint: [
        ],
        mainLoop: [
            { action: "grab", subject: "arm", object: { s: 2 } },
            { action: "link", subject1: "arm", subject2: "brm" },
            { action: "grab", subject: "brm", object: { arm: "arm", d: "ox" } },
            { action: "noop" },
            { action: "noop" },
            { action: "noop" },
        ]
    }, {
        entryPoint: [
        ],
        mainLoop: [
            { action: "noop" },
            { action: "noop" },
            { action: "noop" },
            { action: "noop" },
            { action: "grab", subject: "arm", object: { arm: "brm", d: "nx" } },
            { action: "grab", subject: "brm", object: { arm: "arm", d: "ox" } },
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

const renderer = memoizee(canvas => {
    const renderer = new WebGLRenderer({
        antialias: true,
        canvas,
    });

    const scene = new class extends mixAddTap(Scene) {
        background = new class extends Color {
            constructor() {
                super();
                this.setStyle(document.body.style.backgroundColor);
            }
        }()

        directionalLight = this.addTap(new DirectionalLight(), obj => {
            obj.position.set(-5, 0, 5);
            obj.intensity = 0.3;
        })

        ambientLight = this.addTap(new AmbientLight(), obj => {
            obj.intensity = 0.7;
        })
    }();

    const aspect = renderer.domElement.width / renderer.domElement.height;
    const camera = new PerspectiveCamera(70, aspect, 0.01, 1000);
    camera.position.set(5, 15, 15);

    const controls = new OrbitControls(camera, renderer.domElement);

    return {
        renderer,
        scene,
        camera,
        controls,
        render: (g: Object3D) => {
            controls.update();
            scene.add(g);
            renderer.render(scene, camera);
            scene.remove(g);
        }
    }
});

class Ball extends mixBody(Mesh) {
    geometry = new SphereGeometry();
    material = new class extends MeshPhongMaterial {
        shininess = 0;
    }();
    mass = 0.01;
}
const getOrCreateBallFromCache = memoizee((key: any, i: number) => {
    const ball = new Ball();
    ball.position.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    return ball;
}, {
    max: 1000,
});


class XrmBody extends mixBody(Mesh) {
    geometry = new IcosahedronGeometry(0.5);
    material = new class extends MeshPhongMaterial {
        shininess = 0;
        color = new Color(0xffaadd)
    }();
    mass = 0.02;
}
const getOrCreateXrmBodyFromCache = memoizee((key: any, i: number) => {
    const x = new XrmBody();
    x.position.set(Math.random(), -i, Math.random());
    return x;
}, {
    max: 1000,
});

export function App() {
    // const world = useRecoilValue(worldRecoil);
    const version = <div>
        <span className={css({ fontSize: "16px", })} >{appVersion.split("+")[0]}</span>
        <span className={css({ fontSize: "10px", })} >+{appVersion.split("+")[1]}</span>
    </div>;

    const [step, setStep] = useState(0);
    const [autoplay, setAutoplay] = useState(false);

    useEffect(() => {
        if (!autoplay) { return; }
        const handler = setInterval(() => setStep(step => step + 1), 500);
        return () => clearInterval(handler);
    }, [autoplay])

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
                ox: initialUpc,
                d: 1,
            },
            crm: {
                ox: initialUpc,
                d: 1,
            },
        } as Xrm)),
        upi: [initialUpc] as Upc[]
    };
    const worldSnapshots = [] as any[];
    for (let i = 0; i < step; i++) {
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
                            case "nx": {
                                arm.ox = xrm[action.object.arm].ox?.nx;
                                break;
                            }
                            case "ux": {
                                arm.ox = xrm[action.object.arm].ox?.ux;
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

        const { render } = renderer(canvasRef.current);

        const scene = new (mixAddTap(Group))();

        const balls = world.upi.map((upc, i) => {
            const ball = scene.addTap(getOrCreateBallFromCache(render, i));
            ball.material.color.setStyle(substanceColors[upc.sid]);
            return ball;
        });
        balls[0].isKinematic = true;

        const links = [] as PhysicsLink[];

        const ensureLink = (ball: PhysicsBody, ball2: PhysicsBody) => {
            const existingLink = links.find(({ body1, body2 }) =>
                (body2 === ball && body1 === ball2)
                || (body1 === ball && body2 === ball2));
            if (!existingLink) {
                const link = scene.addTap(new class extends Mesh {
                    geometry = new CylinderGeometry();
                    material = new class extends MeshPhongMaterial {
                        shininess = 0;
                        color = new Color(0xffaaaa)
                    }();
                    body1 = ball;
                    body2 = ball2;
                    onBeforeRender = () => {
                        link.position.copy(link.body1.position);
                        link.position.lerp(link.body2.position, 0.5);
                        link.lookAt(link.body1.position);
                        link.rotateX(Math.PI / 2);
                        const d = link.body1.position.distanceTo(link.body2.position);
                        link.scale.set(0.1, d - 2.5, 0.1);
                    };
                    k = 0.05;
                }());
                links.push(link);
            }
        }

        for (let i = 0; i < balls.length; i++) {
            const upc = world.upi[i];
            const ball = balls[i];
            if (upc.nx) { ensureLink(ball, balls[world.upi.indexOf(upc.nx)]); }
            if (upc.ux) { ensureLink(ball, balls[world.upi.indexOf(upc.ux)]); }
        }

        function addXrmLink(x: PhysicsBody, ball: PhysicsBody) {
            const link = scene.addTap(new class extends Mesh {
                geometry = new CylinderGeometry();
                material = new class extends MeshPhongMaterial {
                    shininess = 0;
                    color = new Color(0xffaadd)
                }();
                body1 = ball;
                body2 = x;
                update() {
                    this.position.copy(this.body1.position);
                    this.position.lerp(this.body2.position, 0.5);
                    this.lookAt(this.body1.position);
                    this.rotateX(Math.PI / 2);
                    const d = this.body1.position.distanceTo(this.body2.position);
                    this.scale.set(0.1, d, 0.1);
                }
                onBeforeRender = this.update.bind(this);
                k = 0.1;
            }());
            links.push(link);
        }

        const xrms = world.xrms.map((xrm, i) => {
            const x = scene.addTap(getOrCreateXrmBodyFromCache(render, i));
            if (xrm.arm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.arm.ox)]); }
            if (xrm.brm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.brm.ox)]); }
            if (xrm.crm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.crm.ox)]); }
            return x;
        });


        const bodies = [...balls, ...xrms];

        const gravity = new Vector3(0, -9.81, 0);

        let handler: number;
        let lastTimeMs = performance.now();
        const tick = (timeMs: number) => {
            const dt = Math.min(0.1, (timeMs - lastTimeMs) / 1000);

            physicsTick({
                dt,
                gravity,
                bodies,
                links,
            });

            render(scene);
            lastTimeMs = timeMs;
            handler = requestAnimationFrame(tick);
        };
        tick(performance.now());
        return () => cancelAnimationFrame(handler);
    }, [canvasRef.current, world]);

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
            <canvas ref={canvasRef} width="700" height="400"></canvas><br />
            <button onClick={() => setStep(0)}>reset</button>
            <button onClick={() => setStep(step + 1)}>step</button>
            <button onClick={() => setAutoplay(!autoplay)}>autoplay</button>
            {step}
            {s.sources.map((source, i) => <div>
                <div>xrm #{i}:</div>
                <code>
                    entry point:<br />
                    {source.entryPoint.map((line, i) => <span>
                        {i.toString().padStart(2, "0")}| {JSON.stringify(line)}<br />
                    </span>)}
                    main loop:<br />
                    {source.mainLoop.map((line, j) => <span className={cx(css({
                        background:
                            j === (step % s.sources[i].mainLoop.length)
                                ? "yellow"
                                : "transparent",
                    }))}>
                        {j.toString().padStart(2, "0")}| {JSON.stringify(line)}<br />
                    </span>)}
                </code>
            </div>)}
            {/* {worldSnapshots.map(s => <div>{s}</div>)} */}
            {version}
        </div>
    </div>
}
