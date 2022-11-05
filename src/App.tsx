import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useState } from "react";
import { appVersion } from "./appVersion";
import { stepInPlace } from "./puzzle/stepInPlace";
import { initialWorld } from "./puzzle/terms";
import { fishSolution as solution } from "./hardcodedSolutions";

import { PlaybackPanel } from "./PlaybackPanel";
import { SourceLineEditor } from "./SourceLineEditor";
import { MainScene } from "./MainScene";
import { Canvas } from "@react-three/fiber";
import { DefaultOrbitControls } from "./utils/DefaultOrbitControls";

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
        <Canvas
            className={cx(css({
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: -1,
            }))}
            camera={{
                fov: 40,
                near: 0.1,
                far: 1000,
                position: [5, 15, 15],
            }}
        >
            <DefaultOrbitControls />
            <MainScene world={world} />
        </Canvas>
        <div className={cx(css({
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: "none",
        }))}>
            <div className={cx(css({
                position: "relative",
            }))}>
                <PlaybackPanel
                    stepState={stepState}
                    className={cx(css({
                        position: "absolute",
                        margin: "0 0 0 25px",
                        background: "salmon",
                        borderRadius: "8px 8px 0px 0px",
                        padding: "5px 10px 0px 10px",
                        bottom: 0,
                        pointerEvents: "all",
                    }))} />
                <div className={cx(css({
                    position: "absolute",
                    padding: "5px 20px 3px 10px",
                    textAlign: "right",
                    lineHeight: "0.8rem",
                    fontSize: "24px",
                    color: "salmon",
                    opacity: 0.5,
                    bottom: 0,
                    right: 0,
                }))}>
                    {appVersion.split("+")[0]}<br />
                    <span className={css({ fontSize: "0.5em", })} >{appVersion.split("+")[1]}</span>
                </div>
            </div>
            <div className={cx(css({
                height: 200,
                background: "salmon",
                borderRadius: "15px 15px 0px 0px",
                margin: "0px 10px 0px 10px",
                pointerEvents: "all",
                overflow: "scroll",
            }))}>
                <div
                    className={cx(css({
                        padding: "5px",
                        width: "fit-content",
                    }))}
                >
                    {
                        solution.sources.map((source, i) => {
                            return <div
                                className={cx(css({
                                    margin: "5px",
                                    background: "grey",
                                    whiteSpace: "nowrap",
                                }))}
                            >
                                {source.mainLoop.map((line, j) => <SourceLineEditor
                                    className={cx(
                                        css({
                                            width: 30,
                                            display: "inline-block",
                                            margin: "3px",
                                            background: (j === step % solution.sources[i].mainLoop.length) ? "yellow" : "lightgrey",
                                        })
                                    )}
                                    line={line}
                                />)}
                            </div>
                        })
                    }
                </div>
            </div>
        </div>

    </div>
}
