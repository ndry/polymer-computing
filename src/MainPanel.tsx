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
                position: "relative",
            }),
            className,
        )}
        {...props}
    >
        <MainPanelNodedBackground className={cx(css({
            position: "absolute",
            width: "100%",
            height: "100%",
        }))} />
        <div>
            <PlaybackPanel
                stepState={stepState}
                className={cx(css({
                    margin: "21px 0 0 90px",
                    color: "#efcfff",
                    bottom: 0,
                    pointerEvents: "all",
                }))} />
            <div className={cx(css({
                margin: "-40px 10px 0 0",
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
            pointerEvents: "all",
            padding: "40px 27px 30px 34px",
        }))}>
            <div
                className={cx(css({
                    overflow: "scroll",
                }))}
            >
                <ProgramEditor
                    solutionState={solutionState}
                    step={step}
                />
            </div>
        </div>
    </div>;
}
