import { css, cx } from "@emotion/css";
import { useRecoilState } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import { fishSolution, newTetrahedron, shortTestSolution, tetrahedron } from "./hardcodedSolutions";

export function SidePanel({
    className, ...props
}: {} & JSX.IntrinsicElements["div"]) {
    const [solution, setSolution] = useRecoilState(solutionRecoil);
    const solutions = [shortTestSolution, tetrahedron, newTetrahedron, fishSolution];

    return <div
        className={cx(
            css({
                background: "#008081a0",
                border: "solid",
                borderColor: "blue",
            }),
            className,
        )}
        {...props}
    >
        {
            solutions.map((x, counter) => <li className={cx(css({
                background: x == solution ? "#108081a0" : ""
            }))}
                onClick={() => setSolution(x)}>{"solution: " + ++counter}</li>)
        }
    </div>
}