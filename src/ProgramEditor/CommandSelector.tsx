import { css, cx } from "@emotion/css";
import { XrmCommand } from "../puzzle/terms";
import { color1, color2 } from "../colorTheme";
import { HandRock } from "@emotion-icons/fa-solid/HandRock";
import { HandPaper } from "@emotion-icons/fa-solid/HandPaper";
import { Link } from "@emotion-icons/fa-solid/Link";
import { Unlink } from "@emotion-icons/fa-solid/Unlink";
import { Ban } from "@emotion-icons/fa-solid/Ban";
import { Cloud } from "@emotion-icons/fa-solid/Cloud";
import { StateTuple } from "./StateTuple";
import { cyclicSelectorMixin } from "./cyclicSelectorMixin";


export function CommandSelector({
    commandState, className, ...props
}: {
    commandState: StateTuple<XrmCommand[0]>;
} & JSX.IntrinsicElements["button"]) {
    const [command, setCommand] = commandState;

    const Icon = {
        "noop": Ban,
        "catch": Cloud,
        "grab": HandRock,
        "loose": HandPaper,
        "link": Link,
        "unlink": Unlink,
    }[command];

    return <button
        className={cx(
            css({
                background: "transparent",
                color: color1,
                border: "0.1em solid",
                borderColor: "transparent",
                borderRadius: "50%",
                aspectRatio: "1 / 1",
                textAlign: "center",
                fontWeight: "bold",
                padding: "0",
            }),
            css`&:hover {
                background: ${color1};
                color: ${color2};
                border-color: ${color2};
            }`,
            css`
            &:hover svg * {
                stroke: ${color1};
            }
            `,
            className
        )}
        {...cyclicSelectorMixin(
            ["noop", "catch", "grab", "loose", "link", "unlink"] as const,
            commandState,
        )}
        {...props}
    >
        <Icon className={cx(
            css({
                scale: "-1 1",
            }),
            css`& * {
                stroke: ${color2};
                stroke-width: 4%;
            }`
        )} />
    </button>;
}
