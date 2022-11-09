import { css, cx } from "@emotion/css";
import { XrmSourceLine } from "./puzzle/terms";

import { HandRock } from "@emotion-icons/fa-solid/HandRock";
import { Link } from "@emotion-icons/fa-solid/Link";
import { Unlink } from "@emotion-icons/fa-solid/Unlink";
import { Ban } from "@emotion-icons/fa-solid/Ban";

export function SourceLineEditor({
    line, className, ...props
}: {
    line: XrmSourceLine,
} & JSX.IntrinsicElements["div"]) {
    const [command] = line;
    const arm = line[1];
    const brm = (() => {
        if (command === "noop") { return; }
        if (command === "grab") {
            const [, , args] = line;
            if (!args) { return; }
            if ("sid" in args) { return; }
            return args.brm;
        }
        if (command === "link") { return line[2]; }
        if (command === "unlink") { return line[2]; }
    })();

    const Icon = {
        "noop": Ban,
        "grab": HandRock,
        "link": Link,
        "unlink": Unlink,
    }[command];

    return <div
        className={cx(
            css({
                position: "relative",
                margin: "0 -0.09vh",
                fontSize: "1.5vh",
                width: "5vh",
                height: "3vh",
            }),
            className,
        )}
        {...props}
    >
        <div
            className={cx(
                css({
                    position: "absolute",
                    color: "#efcfff",
                    borderRadius: "50%",
                    width: "60%",
                    height: "94%",
                    left: "20%",
                    textAlign: "center",
                    fontSize: "100%",
                    lineHeight: "200%",
                }),
            )}
        >
            <Icon className={cx(
                css({
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    left: 0,
                    top: 0,
                    scale: "-1 1",
                }),
                css`& * {
                    stroke: #0a000d;
                    stroke-width: 4%;
                }`,
            )} />
            {(() => {
                if (command !== "grab") { return; }
                const [, , args] = line;
                return <div className={cx(css({
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    lineHeight: "210%",
                    left: "-5%",
                    top: "2%",
                    color: "#0a000d",
                    textAlign: "center",
                }))}>
                    {(() => {
                        if (!args) { return; }
                        if ("sid" in args) { return "s" + args.sid; }
                        const { brm } = args;
                        if (!("d" in args)) { return ; }
                        return `${args.d}${args.rel ? "*" : ""}-`;
                    })()}
                </div>;
            })()}
        </div>
        {arm && <div
            className={cx(
                css({
                    position: "absolute",
                    left: 0,
                    top: 0,
                    background: "#efcfff",
                    color: "#0a000d",
                    border: "#0a000d 0.01vh solid",
                    borderRadius: "50%",
                    width: "24%",
                    height: "41%",
                    margin: "0px",
                    textAlign: "center",
                    fontSize: "100%",
                    lineHeight: "80%",
                    fontWeight: "bold",
                }),
            )}
        >{arm?.[0] ?? "-"}</div>}
        {brm && <div
            className={cx(
                css({
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    background: "#efcfff",
                    color: "#0a000d",
                    border: "#0a000d 0.01vh solid",
                    borderRadius: "50%",
                    width: "24%",
                    height: "41%",
                    margin: "0px",
                    textAlign: "center",
                    fontSize: "100%",
                    lineHeight: "80%",
                    fontWeight: "bold",
                }),
            )}
        >{brm?.[0] ?? "-"}</div>}
    </div>;
}
