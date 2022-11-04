import { css, cx } from "@emotion/css";
import { XrmSourceLine } from "./puzzle/terms";
import { JSX } from "preact";
import { signalValueOrSelf } from "./utils/signalValueOrSelf";

import { HandRock } from "@emotion-icons/fa-solid/HandRock";
import { Link } from "@emotion-icons/fa-solid/Link";
import { Unlink } from "@emotion-icons/fa-solid/Unlink";
import { Ban } from "@emotion-icons/fa-solid/Ban";

export function SourceLineEditor({
    line, className, ...props
}: {
    line: XrmSourceLine,
} & JSX.IntrinsicElements["div"]) {
    return <div
        className={cx(
            css({
                position: "relative",
                padding: "0px",
                fontSize: "14px",
                lineHeight: "14px",
            }),
            signalValueOrSelf(className),
        )}
        {...props}
    >{(() => {
        const [command] = line;
        if (command === "noop") {
            return <>
                <Ban className={cx(css({
                    opacity: 0.1,
                }))} />
                <div className={cx(css({
                    position: "absolute",
                    top: 2,
                    left: 2,
                }))}>
                    <Ban className={cx(css({
                        height: 15,
                    }))} />
                </div>
            </>;
        }
        if (command === "grab") {
            const [, arm, args] = line;
            return <>
                <HandRock className={cx(css({
                    opacity: 0.1,
                }))} />
                <div className={cx(css({
                    position: "absolute",
                    top: 2,
                    left: 2,
                }))}>
                    <HandRock className={cx(css({
                        height: 15,
                    }))} />
                    {arm[0]}<br />
                    {(() => {
                        if (!args) { return; }
                        if ("sid" in args) { return "s" + args.sid; }
                        const { brm } = args;
                        if (!("d" in args)) { return brm[0]; }
                        return `${brm[0]}-${args.d}${args.rel ? "-rel" : ""}`;
                    })()}
                </div>
            </>;
        }
        if (command === "link") {
            const [, arm, brm] = line;
            return <>
                <Link className={cx(css({
                    opacity: 0.1,
                }))} />
                <div className={cx(css({
                    position: "absolute",
                    top: 2,
                    left: 2,
                }))}>
                    <Link className={cx(css({
                        height: 15,
                    }))} />
                    {arm[0]}<br />
                    {brm[0]}
                </div>
            </>;
        }
        if (command === "unlink") {
            const [, arm, brm] = line;
            return <>
                <Unlink className={cx(css({
                    opacity: 0.1,
                }))} />
                <div className={cx(css({
                    position: "absolute",
                    top: 2,
                    left: 2,
                }))}>
                    <Unlink className={cx(css({
                        height: 15,
                    }))} />
                    {arm[0]}<br />
                    {brm[0]}
                </div>
            </>;
        }
        return JSON.stringify(line);
    })()}</div>;
}
