import { css, cx } from "@emotion/css";
import { appVersion } from "./appVersion";
import { fishSolution as solution } from "./hardcodedSolutions";
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
                <span className={css({ fontSize: "0.5em", })}>{appVersion.split("+")[1]}</span>
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
                {solution.sources.map((source, i) => {
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
                            line={line} />)}
                    </div>;
                })}
            </div>
        </div>
    </div>;
}