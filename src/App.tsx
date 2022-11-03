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

export type XrmSourceLine =
    ["grab", XrmArmKey,
        undefined
        | { sid: SubstanceId }
        | { brm: XrmArmKey }
        | { brm: XrmArmKey, d: number, rel: boolean }]
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

export type Solution = {
    problem: undefined,
    sources: Array<{
        entryPoint: XrmSourceLine[],
        mainLoop: XrmSourceLine[],
    }>,
}


// const s: Solution = {
//     problem: undefined,
//     sources: [{
//         entryPoint: [
//         ],
//         mainLoop: [
//             ["grab", "brm", { sid: 1 }],
//             ["grab", "crm", { sid: 2 }],
//             ["link", "brm", "crm"],
//             ["grab", "brm", { sid: 3 }],
//             ["link", "brm", "crm"],
//             ["grab", "crm", { brm: "crm", d: 0, rel: false }],
//             ["link", "brm", "crm"],
//             ["grab", "brm", { sid: 4 }],
//             ["link", "brm", "crm"],
//             ["grab", "crm", { brm: "crm", d: 0, rel: false }],
//             ["link", "brm", "crm"],
//             ["grab", "crm", { brm: "crm", d: 1, rel: false }],
//             ["link", "brm", "crm"],
//         ]
//     }],
// }

const s: Solution = {
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
        links: [],
    }
    let world = {
        xrms: s.sources.map(() => ({
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
        } as Xrm)),
        upi: [initialUpc] as Upc[]
    };
    const worldSnapshots = [] as any[];
    for (let i = 0; i < step; i++) {
        const sLink = (link: Link | undefined) => link ? (world.upi.indexOf(link[0]) + ":" + world.upi.indexOf(link[1])) : '-';
        worldSnapshots.push(<div>
            {i}<br />
            xrms: {world.xrms.map(xrm => JSON.stringify({
                arm: {
                    ox: xrm.arm.ox ? world.upi.indexOf(xrm.arm.ox) : '-',
                    from: sLink(xrm.arm.from),
                    flip: xrm.arm.flip,
                },
                brm: {
                    ox: xrm.brm.ox ? world.upi.indexOf(xrm.brm.ox) : '-',
                    from: sLink(xrm.brm.from),
                    flip: xrm.brm.flip,
                },
                crm: {
                    ox: xrm.crm.ox ? world.upi.indexOf(xrm.crm.ox) : '-',
                    from: sLink(xrm.crm.from),
                    flip: xrm.crm.flip,
                },
            }))}<br />
            upi: {world.upi.map(upc => JSON.stringify({
                sid: upc.sid,
                links: upc.links.map(sLink),
            }))}<br />
        </div>);

        for (let j = 0; j < world.xrms.length; j++) {
            const xrm = world.xrms[j];
            const source = s.sources[j];
            const line =
                i < source.entryPoint.length
                    ? source.entryPoint[i]
                    : source.mainLoop[(i - source.entryPoint.length) % source.mainLoop.length];

            const command = line[0];

            const other = (link: Link, upc: Upc) => link[link[0] === upc ? 1 : 0];
            const atCircle = <T,>(arr: T[], i: number) => {
                i = i % arr.length;
                if (i < 0) { i += arr.length; }
                return arr[i];
            }

            switch (command) {
                case "grab": {
                    const [, armKey, args] = line;
                    const arm = xrm[armKey];
                    if (!args) {
                        arm.ox = undefined;
                        arm.from = undefined;
                        break;
                    }

                    if (!("brm" in args)) {
                        const upc: Upc = {
                            sid: args.sid,
                            links: [],
                        };
                        world.upi.push(upc);
                        arm.ox = upc;
                        arm.from = undefined;
                        break;
                    }

                    const brm = xrm[args.brm];
                    if ("d" in args) {
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
                case "link": {
                    const arm = xrm[line[1]];
                    const brm = xrm[line[2]];
                    if (!arm.ox) { throw "not possible"; }
                    if (arm.ox.links.length >= 3) { throw "not possible"; }
                    if (!brm.ox) { throw "not possible"; }
                    if (brm.ox.links.length >= 3) { throw "not possible"; }
                    if (arm.ox === brm.ox) { throw "not possible"; }

                    const existingLink = arm.ox.links.length > 0
                        && arm.ox.links.find(link =>
                            (link[0] === arm.ox && link[1] === brm.ox)
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

                    const link = arm.ox.links.find(link =>
                        (link[0] === arm.ox && link[1] === brm.ox)
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
            for (const link of upc.links) {
                ensureLink(
                    balls[world.upi.indexOf(link[0])],
                    balls[world.upi.indexOf(link[1])]);
            }
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
            <canvas ref={canvasRef} width="700" height="700"></canvas><br />
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
