import { css, cx } from "@emotion/css";
import { CommandEditor } from "./CommandEditor";
import update from "immutability-helper";
import { Solution } from "../puzzle/terms";
import { Dispatch, SetStateAction } from "react";

function ensureSolutionEditability(solution: Solution) {
    let botsNeeded = 1;
    for (let i = solution.sources.length - 1; i >= 0; i--) {
        if (solution.sources[i].mainLoop.some(s => s[0] !== "noop")) {
            botsNeeded = i + 1;
            break;
        }
    }
    solution = update(solution, {
        sources: { $splice: [[botsNeeded + 1]] }
    });
    while (solution.sources.length < botsNeeded + 1) {
        solution = update(solution, {
            sources: {
                $push: [{
                    entryPoint: [],
                    mainLoop: [],
                }]
            }
        });
    }

    const lengthNeeded = Math.max(
        ...solution.sources.map(s => {
            for (let i = s.mainLoop.length - 1; i >= 0; i--) {
                if (s.mainLoop[i][0] !== "noop") {
                    return i + 1;
                }
            }
            return 1;
        }));

    for (let i = 0; i < solution.sources.length; i++) {
        solution = update(solution, {
            sources: {
                [i]: { mainLoop: { $splice: [[lengthNeeded + 1]] } }
            }
        });
        while (solution.sources[i].mainLoop.length < lengthNeeded + 1) {
            solution = update(solution, {
                sources: {
                    [i]: { mainLoop: { $push: [["noop"]] } }
                }
            });
        }
    }

    return solution;
}


type State<T> = [T, Dispatch<SetStateAction<T>>];

export function ProgramEditor({
    solutionState: [solution, setSolution], step
}: {
    solutionState: State<Solution>;
    step: number;
}) {
    const _solution = ensureSolutionEditability(solution);
    const _setSolution = (nextSolution: Solution) =>
        setSolution(ensureSolutionEditability(nextSolution));
    return <>
        {_solution.sources.map((source, i) => {
            return <div
                key={i}
                className={cx(css({
                    display: "flex",
                    flexDirection: "row",
                    width: "fit-content",
                }))}
            >
                {source.mainLoop.map((command, j) => {
                    const len = _solution.sources[i].mainLoop.length;
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
                            nextCommand => _setSolution(update(_solution, {
                                sources: { [i]: { mainLoop: { [j]: { $set: nextCommand } } } }
                            }))
                        ]} />
                    </div>;
                })}
            </div>;
        })}
    </>;
}
