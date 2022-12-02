import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useState } from "react";
import { stepInPlace } from "./puzzle/stepInPlace";
import { initialWorld } from "./puzzle/terms";

import { MainScene } from "./MainScene";
import { Canvas } from "@react-three/fiber";
import { DefaultOrbitControls } from "./utils/DefaultOrbitControls";
import { MainPanel } from "./MainPanel";
import { useRecoilValue } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import { SidePanel } from "./SidePanel";
import { color1 } from "./colorTheme";

export function App() {
    const solution = useRecoilValue(solutionRecoil);
    // const world = useRecoilValue(worldRecoil);

    const [displaySidePanel, setDisplaySidePanel] = useState(false);

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
        <div className={cx(css({
            position: "absolute",
            inset: 0,
            zIndex: -1,
        }))}>
            <Canvas
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
        </div>
        <SidePanel className={cx(css({
            width: displaySidePanel ? "342px" : "0px",
            flexShrink: "0",
            position: "relative",
            transition: "all 0.5s",
            opacity: !displaySidePanel ? "0" : "1",
        }))} />
        <button
            className={cx(css({
                height: "fit-content",
                background: "#efcfffa0",
            }))}
            onClick={() => setDisplaySidePanel(!displaySidePanel)}
        >{displaySidePanel ? "<" : ">"}
        </button>
        <div className={cx(css({
            flex: "auto",
            pointerEvents: "none",
            position: "relative",
        }))}>
            <div className={cx(css({
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
            }))}>
                <div className={cx(css({
                    position: "relative",
                    flex: "auto",
                }))}>
                    { /* more on screen panels here */}
                    <div className={cx(css({
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        color: color1,
                    }))}>
                        {world.targetsSoved} / {solution.problem.targets[0].count}
                    </div>
                </div>
                <MainPanel
                    className={cx(css({
                        height: "242px",
                    }))}
                    stepState={stepState}
                />
            </div>
        </div>

    </div>
}
