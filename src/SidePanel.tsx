import { css, cx } from "@emotion/css";
import { useRecoilState } from "recoil";
import { solutionRecoil } from "./solutionRecoil";
import * as solutions from "./hardcodedSolutions";
import { SidePanelNodedBackground } from "./SidePanelNodedBackground";

export function SidePanel({
    className, ...props
}: {} & JSX.IntrinsicElements["div"]) {
    const [solution, setSolution] = useRecoilState(solutionRecoil);

    return <div
        className={cx(
            css({}),
            className,
        )}
        {...props}
    >
        <SidePanelNodedBackground className={cx(css({
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: -1,

        }))} />
        <div className={cx(css({
            margin: "100px 50px 50px 50px"
        }))}>
            {
                Object.entries(solutions).map(([key, s]) => <li
                    key={key}
                    className={cx(css({
                        color: s == solution ? "#d381fc" : "#efcfff",
                    }))}
                    onClick={() => setSolution(s)}
                >{key}</li>)
            }
        </div>
    </div>
}