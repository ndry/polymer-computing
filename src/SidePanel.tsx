import { css, cx } from "@emotion/css";

export function SidePanel() {
    return <div className={cx(css({
        height: "100%",
        width: "242px",
        background: "#008081a0",
        border: "solid",
        borderColor: "blue",
    }))}>
        {
            ["green", "blue", "red"].map(source => <li>{source}</li>)
        }
    </div>
}