import { css, cx } from "@emotion/css";
import update from "immutability-helper";
import { Dispatch, SetStateAction } from "react";
import { color1, color2 } from "../colorTheme";
import { XrmCommand } from "../puzzle/terms";
import { ArmSelector } from "./ArmSelector";
import { CommandSelector } from "./CommandSelector";
import { cyclicSelectorMixin } from "./cyclicSelectorMixin";

export type State<T> = [T, Dispatch<SetStateAction<T>>];

export function CommandEditor({
    commandState, className, ...props
}: {
    commandState: [XrmCommand, (nextCommand: XrmCommand) => void],
} & JSX.IntrinsicElements["div"]) {
    const [command, setCommand] = commandState;

    const [commandKey] = command;
    const arm = command[1];
    const brm = (() => {
        if (commandKey === "noop") { return; }
        if (commandKey === "catch") { return; }
        if (commandKey === "loose") { return; }
        if (commandKey === "grab") { return command[2]; }
        if (commandKey === "link") { return command[2]; }
        if (commandKey === "unlink") { return command[2]; }
    })();

    return <div
        className={cx(
            css({
                position: "relative",
                aspectRatio: "5 / 3",
            }),
            className,
        )}
        {...props}
    >

        <CommandSelector
            className={cx(css({
                position: "absolute",
                left: "20%",
                bottom: 0,
                height: "100%",
                margin: "0px",
                fontSize: "100%",
            }))}
            commandState={[
                commandKey,
                (nextCommandKey) => {
                    const _nextCommandKey =
                        nextCommandKey instanceof Function
                            ? nextCommandKey(commandKey)
                            : nextCommandKey;
                    switch (_nextCommandKey) {
                        case "catch": {
                            setCommand([_nextCommandKey, arm ?? "arm", 0]);
                            break;
                        }
                        case "grab": {
                            setCommand([_nextCommandKey, arm ?? "arm", brm ?? "brm"]);
                            break;
                        }
                        case "loose": {
                            setCommand([_nextCommandKey, arm ?? "arm"]);
                            break;
                        }
                        case "link": {
                            setCommand([_nextCommandKey, arm ?? "arm", brm ?? "brm"]);
                            break;
                        }
                        case "unlink": {
                            setCommand([_nextCommandKey, arm ?? "arm", brm ?? "brm"]);
                            break;
                        }
                        case "noop": {
                            setCommand([_nextCommandKey]);
                            break;
                        }
                    }
                }
            ]}
        />
        {(commandKey === "catch") && <button
            className={cx(
                css({
                    position: "absolute",
                    background: color1,
                    color: color2,
                    borderRadius: "50%",
                    border: "0.1em solid",
                    borderColor: color2,
                    height: "50%",
                    aspectRatio: "1 / 1",
                    left: "34%",
                    top: "25%",
                    textAlign: "center",
                    fontSize: "100%",
                    padding: "0px",
                }),
                css`&:hover {
                        background: ${color2};
                        color: ${color1};
                        border-color: ${color1};
                    }`,
            )}
            {...cyclicSelectorMixin(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const,
                [
                    command[2],
                    (next) => setCommand(update(command, {
                        [2]: {
                            $set:
                                (next instanceof Function)
                                    ? next(command[2])
                                    : next
                        }
                    }))
                ]
            )}
        >
            <div className={cx(css({
                textAlign: "center",
                margin: "-20%",
            }))}>{command[2]}</div>
        </button>}

        {(commandKey === "grab") && <button
            className={cx(
                css({
                    position: "absolute",
                    background: color1,
                    color: color2,
                    borderRadius: "50%",
                    border: "0.1em solid",
                    borderColor: color2,
                    height: "50%",
                    aspectRatio: "1 / 1",
                    left: "34%",
                    top: "25%",
                    textAlign: "center",
                    fontSize: "100%",
                    padding: "0px",
                }),
                css`&:hover {
                        background: ${color2};
                        color: ${color1};
                        border-color: ${color1};
                    }`,
            )}
            {...cyclicSelectorMixin(
                [undefined, 0, 1, 2] as const,
                [
                    command[3]?.d,
                    (next) => {
                        const _next = (next instanceof Function)
                            ? next(command[3]?.d)
                            : next;

                        if (_next === undefined) {
                            setCommand(update(command, {
                                [3]: { $set: undefined }
                            }));
                        } else {
                            setCommand(update(command, {
                                [3]: { $set: {
                                    d: _next,
                                } }
                            }));
                        }
                    }
                ]
            )}
        >
            <div className={cx(css({
                textAlign: "center",
                margin: "-20%",
            }))}>
                {(() => {
                    const [, , , args] = command;
                    if (!args) { return; }
                    return `${args.d}${args.rel ? "*" : ""}-`;
                })()}
            </div>
        </button>}
        {arm && <ArmSelector
            className={cx(css({
                position: "absolute",
                left: 0,
                top: 0,
                height: "60%",
                margin: "0px",
                fontSize: "100%",
            }))}
            armState={[
                arm,
                (nextArm) => setCommand(update(command, {
                    [1]: {
                        $set:
                            (nextArm instanceof Function)
                                ? nextArm(arm)
                                : nextArm
                    }
                }))
            ]}
        />}
        {brm && <ArmSelector
            className={cx(css({
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "60%",
                margin: "0px",
                fontSize: "100%",
            }))}
            armState={[
                brm,
                (nextArm) => setCommand(update(command, {
                    [2]: {
                        $set:
                            (nextArm instanceof Function)
                                ? nextArm(brm)
                                : nextArm
                    }
                }))
            ]}
        />}
    </div>;
}
