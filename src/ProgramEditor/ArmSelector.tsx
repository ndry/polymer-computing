import { css, cx } from "@emotion/css";
import { XrmArmKey } from "../puzzle/terms";
import { color1, color2 } from "../colorTheme";
import { Dispatch, SetStateAction } from "react";
import { cyclicSelectorMixin } from "./cyclicSelectorMixin";

export type State<T> = [T, Dispatch<SetStateAction<T>>];

export function ArmSelector({
    armState, className, ...props
}: {
    armState: State<XrmArmKey>;
} & JSX.IntrinsicElements["button"]) {
    const [arm, setArm] = armState;

    return <button
        className={cx(
            css({
                background: color1,
                color: color2,
                border: "0.1em solid",
                borderColor: color2,
                borderRadius: "50%",
                aspectRatio: "1 / 1",
                textAlign: "center",
                fontWeight: "bold",
                padding: "0",
            }),
            css`&:hover {
                background: ${color2};
                color: ${color1};
                border-color: ${color1};
            }`,
            className
        )}
        {...cyclicSelectorMixin(
            ["arm", "brm", "crm"] as const,
            armState,
        )}
        {...props}
    ><div className={cx(css({ marginTop: "-28%" }))}>{arm[0]}</div></button>;
}
