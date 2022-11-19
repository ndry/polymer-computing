import { css, cx } from "@emotion/css";
import { useRecoilState } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import * as solutions from "./hardcodedSolutions";

export function SidePanel({
    className, ...props
}: {} & JSX.IntrinsicElements["div"]) {
    const [solution, setSolution] = useRecoilState(solutionRecoil);

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
            Object.entries(solutions).map(([key, s]) => <li
                key={key}
                className={cx(css({
                    background: s === solution ? "#108081a0" : ""
                }))}
                onClick={() => setSolution(s)}
            >{key}</li>)
        }
    </div>
}