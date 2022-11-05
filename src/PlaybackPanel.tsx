import { css, cx } from "@emotion/css";
import { useEffect, useState } from "react";
import { StopFill } from "@emotion-icons/bootstrap/StopFill";
import { PlayFill } from "@emotion-icons/bootstrap/PlayFill";
import { PauseFill } from "@emotion-icons/bootstrap/PauseFill";
import { SkipEndFill } from "@emotion-icons/bootstrap/SkipEndFill";

export function PlaybackPanel({
    stepState: [step, setStep], className, ...props
}: {
    stepState: [number, React.Dispatch<React.SetStateAction<number>>];
} & JSX.IntrinsicElements["div"]) {

    const [autoplay, setAutoplay] = useState(false);

    useEffect(() => {
        if (!autoplay) { return; }
        const handler = setInterval(() => setStep(step => step + 1), 500);
        return () => clearInterval(handler);
    }, [autoplay]);

    return <div
        className={cx(
            css({
                width: "fit-content",
                height: "fit-content",
            }),
            className,
        )}
        {...props}
    >
        <button
            className={cx(css({
                width: "30px",
                padding: "0px",
            }))}
            onClick={() => setStep(0)}
        ><StopFill /></button>
        <span
            className={cx(css({
                verticalAlign: "bottom",
                fontSize: "26px",
                padding: "0px 7px",
                fontFamily: "monospace",
            }))}>{step.toString().padStart(4, "\u00B7")}</span>
        <button
            className={cx(css({
                width: "30px",
                padding: "0px",
            }))}
            onClick={() => {
                setAutoplay(false);
                setStep(step + 1);
            }}
        ><SkipEndFill /></button>
        <button
            className={cx(css({
                width: "30px",
                padding: "0px",
            }))}
            onClick={() => setAutoplay(!autoplay)}
        >{autoplay ? <PauseFill /> : <PlayFill />}</button>
    </div>;
}
