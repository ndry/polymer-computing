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

export function App() {
    const solution = useRecoilValue(solutionRecoil);
    // const world = useRecoilValue(worldRecoil);

    const [displaySidePanel, setDisplaySidePanel] = useState(false);
    const [sidePanelButton, setSidePanelButton] = useState(">");

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
            flexBasis: "242px",
            flexShrink: "0",
            display: displaySidePanel ? "" : "none"
        }))} />
        <button className={cx(css({
            height: "fit-content",
            background: "#008081a0",

        }))}
                onClick={() => {
                    setDisplaySidePanel(!displaySidePanel);
                    setSidePanelButton(displaySidePanel ? ">" : "<");
                }}
        >{sidePanelButton}
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
                    flex: "auto",
                }))}>
                    { /* more on screen panels here */}
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
