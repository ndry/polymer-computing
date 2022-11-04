import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useEffect, useRef, useState } from "preact/hooks";
import { appVersion } from "./appVersion";
import {
    Vector3,
} from "three";
import { physicsTick } from "./physics";
import { stepInPlace } from "./puzzle/stepInPlace";
import { initialWorld } from "./puzzle/terms";
import { fishSolution as solution } from "./hardcodedSolutions";
import { sceneForWorld } from "./sceneForWorld";
import { rendererFor } from "./rendererFor";

export const landscapeWidth = 922;

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


    let world = initialWorld(solution);

    for (let i = 0; i < step; i++) {
        stepInPlace(solution, i, world);
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) { return; }

        const { render } = rendererFor(canvasRef.current);
        const { scene, links, bodies } = sceneForWorld(render, world);
        const gravity = new Vector3(0, -9.81, 0);

        let handler: number;
        let lastTimeMs = performance.now();
        const tick = (timeMs: number) => {
            const dt = Math.min(0.1, (timeMs - lastTimeMs) / 1000);

            physicsTick({ dt, gravity, bodies, links });
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
            {solution.sources.map((source, i) => <div>
                <div>xrm #{i}:</div>
                <code>
                    entry point:<br />
                    {source.entryPoint.map((line, i) => <span>
                        {i.toString().padStart(2, "0")}| {JSON.stringify(line)}<br />
                    </span>)}
                    main loop:<br />
                    {source.mainLoop.map((line, j) => <span className={cx(css({
                        background:
                            j === (step % solution.sources[i].mainLoop.length)
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
