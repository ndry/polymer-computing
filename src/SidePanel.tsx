import { css, cx } from "@emotion/css";

export function SidePanel({
    className, ...props
}: {
} & JSX.IntrinsicElements["div"]) {
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
            ["green", "blue", "red"].map(source => <li>{source}</li>)
        }
    </div>
}