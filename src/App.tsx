import "./initAnalytics";

import { css, cx } from "@emotion/css";
import { useMemo } from "preact/hooks";
import { appVersion } from "./appVersion";

export const landscapeWidth = 922;

export function App() {
    const main = useMemo(() => <>
        main
    </>, []);

    const version = <div>
        <span className={css({ fontSize: "16px", })} >{appVersion.split("+")[0]}</span>
        <span className={css({ fontSize: "10px", })} >+{appVersion.split("+")[1]}</span>
    </div>;

    return <div className={cx(
        css`& {
            font-family: 'Bahnschrift', sans-serif;
            display: flex;
            position: fixed;
            inset: 0;
            overflow: auto;
        }
        `,
        css`&::-webkit-scrollbar { height: 0px; }`
    )}>
        <div className={cx(css`& {
            flex-grow: 1;
            max-width: ${landscapeWidth}px;
            position: relative;
            margin: auto;
        }`)}>

            {main}
            {version}

        </div>
    </div>
}
