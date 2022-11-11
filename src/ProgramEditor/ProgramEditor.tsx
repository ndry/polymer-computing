import { css, cx } from "@emotion/css";
import { CommandEditor } from "./CommandEditor";
import update from "immutability-helper";
import { Solution } from "../puzzle/terms";
import { Dispatch, SetStateAction } from "react";


type State<T> = [T, Dispatch<SetStateAction<T>>];

export function ProgramEditor({
    solutionState: [solution, setSolution], step
}: {
    solutionState: State<Solution>;
    step: number;
}) {
    return <>
        {solution.sources.map((source, i) => {
            return <div
                key={i}
                className={cx(css({
                    display: "flex",
                    flexDirection: "row",
                    width: "fit-content",
                }))}
            >
                {source.mainLoop.map((command, j) => {
                    const len = solution.sources[i].mainLoop.length;
                    const isNext = (j === step % len);
                    const isPrev = ((j + 1) % len === step % len);
                    return <div
                        key={j}
                        className={cx(
                            css({
                                padding: "0.3vh 0",
                                background: isNext ? "linear-gradient(to right, #efcfff 8%, #efcfffd0 12%, #efcfff80 30%, transparent 60%)"
                                    : isPrev ? "linear-gradient(to left, #efcfff 8%, #efcfffd0 12%, #efcfff80 30%, transparent 60%)"
                                        : undefined,
                            })
                        )}
                    ><CommandEditor
                        className={cx(
                            css({
                                fontSize: "1.5vh",
                                margin: "0 -0.09vh",
                                height: "3vh",
                            })
                        )}
                        commandState={[
                            command,
                            nextCommand => setSolution(solution => update(solution, {
                                sources: { [i]: { mainLoop: { [j]: { $set: nextCommand } } } }
                            }))
                        ]} />
                    </div>;
                })}
            </div>;
        })}
    </>;
}
