import { css, cx } from "@emotion/css";
import { appVersion } from "./appVersion";
import { fishSolution as solution } from "./hardcodedSolutions";
import { MainPanelNodedBackground } from "./MainPanelNodedBackground";
import { PlaybackPanel } from "./PlaybackPanel";
import { SourceLineEditor } from "./SourceLineEditor";


export function MainPanel({
    stepState, className, ...props
}: {
    stepState: [number, React.Dispatch<React.SetStateAction<number>>];
} & JSX.IntrinsicElements["div"]) {
    const [step] = stepState;

    return <div
        className={cx(
            css({
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                pointerEvents: "none",
            }),
            className
        )}
        {...props}
    >
        <MainPanelNodedBackground className={cx(css({
            position: "absolute",
            width: "100%",
            height: "242px",
            bottom: 0,
        }))} />
        <div className={cx(css({
            position: "relative",
        }))}>
            <PlaybackPanel
                stepState={stepState}
                className={cx(css({
                    position: "absolute",
                    margin: "0 0 0 90px",
                    color: "#efcfff",
                    bottom: 0,
                    pointerEvents: "all",
                }))} />
            <div className={cx(css({
                position: "absolute",
                textAlign: "right",
                lineHeight: "0.8rem",
                fontSize: "18px",
                color: "#efcfff",
                // opacity: 0.5,
                fontWeight: "lighter",
                bottom: 12,
                right: 10,
            }))}>
                {appVersion.split("+")[0]}<br />
                <span className={css({ fontSize: "0.5em", })}>{appVersion.split("+")[1]}</span>
            </div>
        </div>
        <div className={cx(css({
            height: 190,
            pointerEvents: "all",
            position: "relative",
        }))}>
            <div
                className={cx(css({
                    padding: "20px 30px 30px 30px",
                }))}
            >
                <div
                    className={cx(css({
                        overflow: "scroll",
                    }))}
                >
                    {solution.sources.map((source, i) => {
                        return <div
                            key={i}
                            className={cx(css({
                                margin: "5px",
                                background: "grey",
                                whiteSpace: "nowrap",
                                width: "fit-content",
                            }))}
                        >
                            {source.mainLoop.map((line, j) => <SourceLineEditor
                                key={j}
                                className={cx(
                                    css({
                                        width: 30,
                                        display: "inline-block",
                                        margin: "3px",
                                        background: (j === step % solution.sources[i].mainLoop.length) ? "yellow" : "lightgrey",
                                    })
                                )}
                                line={line} />)}
                        </div>;
                    })}
                </div>
            </div>
        </div>
    </div>;
}
