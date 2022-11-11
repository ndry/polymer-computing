import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useState } from "react";
import { stepInPlace } from "./puzzle/stepInPlace";
import { initialWorld } from "./puzzle/terms";
import { fishSolution as solution } from "./hardcodedSolutions";

import { MainScene } from "./MainScene";
import { Canvas } from "@react-three/fiber";
import { DefaultOrbitControls } from "./utils/DefaultOrbitControls";
import { MainPanel } from "./MainPanel";
import { SidePanel } from "./SidePanel";

export function App() {
    // const world = useRecoilValue(worldRecoil);

    const stepState = useState(0);
    const [step] = stepState;

    let world = initialWorld(solution);

    for (let i = 0; i < step; i++) {
        stepInPlace(solution, i, world);
    }

    return <div className={cx(
        css`& {
            font-family: 'Bahnschrift', sans-serif;
            display: flex;
            position: fixed;
            inset: 0;
            overflow: auto;
        }
        `,
    )}>
        <SidePanel />
        <div className={cx(css({
            height: "100%",
            width: "100%",
        }))}>
            <Canvas
                className={cx(css({
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }))}
                camera={{
                    fov: 40,
                    near: 0.1,
                    far: 1000,
                    position: [0, 30, 45],
                }}
            >
                <DefaultOrbitControls />
                <MainScene world={world} />
            </Canvas>
            <MainPanel stepState={stepState} />
        </div>

    </div>
}
