import { css, cx } from "@emotion/css";
import { appVersion } from "./appVersion";
import { MainPanelNodedBackground } from "./MainPanelNodedBackground";
import { PlaybackPanel } from "./PlaybackPanel";
import { useRecoilState } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import { ProgramEditor } from "./ProgramEditor";


export function MainPanel({
    stepState, className, ...props
}: {
    stepState: [number, React.Dispatch<React.SetStateAction<number>>];
} & JSX.IntrinsicElements["div"]) {
    const [step] = stepState;

    const solutionState = useRecoilState(solutionRecoil);

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
                        padding: "0 10px",
                        margin: 0,
                    }))}
                >
                    <ProgramEditor 
                        solutionState={solutionState}
                        step={step}
                    />
                </div>
            </div>
        </div>
    </div>;
}
