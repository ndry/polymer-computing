import { useEffect, useRef } from "react";
import { tuple } from "./utils/tuple";

type DockedPosition = ({ left: number } | { right: number })
    & ({ top: number } | { bottom: number });
const dockedX = (
    dp: ({ left: number } | { right: number }),
    { left, right }: { left: number, right: number }
) => ("left" in dp) ? (left + dp.left) : (right - dp.right);
const dockedY = (
    dp: ({ top: number } | { bottom: number }),
    { top, bottom }: { top: number, bottom: number }
) => ("top" in dp) ? (top + dp.top) : (bottom - dp.bottom);

export function SidePanelNodedBackground({
    ...props
}: {} & JSX.IntrinsicElements["svg"]) {
    const w = 800;
    const h = 250;
    const dock = { left: -w / 2, right: w / 2, top: -h / 2, bottom: h / 2 };

    const b0 = [
        { left: 12, top: 17 },
        { right: 60, top: 15 },
        { right: 7, top: 14 },
        { right: 8, bottom: 18 },
        { left: 28, bottom: 13 },
    ] as DockedPosition[];

    const b1 = [
        { left: 19, top: 37 },
        { left: 40, top: 13 },
        { right: 17, top: 44 },
        { right: 18, bottom: 8 },
        { left: 13, bottom: 11 },
    ] as DockedPosition[];

    const c0 = [
        { left: 29, top: 58 },
        { left: 32, bottom: 40 },
        { left: 55, bottom: 20 },
    ] as DockedPosition[];

    const c1 = [
        { right: 23, top: 28 },
        { right: 22, bottom: 60 },
        { right: 35, bottom: 25 },
    ] as DockedPosition[];

    const points = [...b0, ...b1, ...c0, ...c1];

    const allLinesInRadius = (p1: DockedPosition, r: number) => points
        .filter(p2 => p1 !== p2)
        .filter(p2 => r > Math.hypot(
            dockedX(p1, dock) - dockedX(p2, dock),
            dockedY(p1, dock) - dockedY(p2, dock),
        ))
        .map(p2 => tuple(p1, p2));

    const lines = [
        ...b0.map((p, i, ps) => [p, ps[(i + 1) % ps.length]]),
        ...b1.map((p, i, ps) => [p, ps[(i + 1) % ps.length]]),
        ...allLinesInRadius(b0[1], 100),
        ...allLinesInRadius(c0[0], 50),
        ...allLinesInRadius(c0[1], 70),
        ...allLinesInRadius(c0[2], 100),
        ...allLinesInRadius(b0[4], 100),
        ...allLinesInRadius(b1[3], 100),
        ...allLinesInRadius(c1[0], 100),
        ...allLinesInRadius(c1[2], 100),
        ...allLinesInRadius(b1[1], 100),
        [c0[0], c0[1]],
        [c0[2], c1[2]],
        [c1[0], c1[1]],
    ];

    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!ref.current) { return; }

        const svgEl = ref.current;
        const circleEls = svgEl.querySelectorAll("circle");
        const lineEls = svgEl.querySelectorAll("line");

        let handler: number;
        let lastTimeMs = performance.now();

        function tick(timeMs: number) {
            const { width, height } = svgEl.getBoundingClientRect();
            const dock = { left: -width / 2, right: width / 2, top: -height / 2, bottom: height / 2 };
            svgEl.setAttribute("viewBox", `${dock.left} ${dock.top} ${width} ${height}`);

            handler = requestAnimationFrame(tick);
            lastTimeMs = timeMs;
            const absTime = (timeMs) / 1000;

            const getRand = (dp: DockedPosition) =>
                (("left" in dp) ? dp.left : dp.right)
                * (("top" in dp) ? dp.top : dp.bottom);
            const getX = (dp: DockedPosition) => {
                const rand = getRand(dp);
                return dockedX(dp, dock)
                    + (1 + 20 * rand * rand % 3) * Math.sin(absTime / (1 + rand * rand % 5));
            }
            const getY = (dp: DockedPosition) => {
                const rand = getRand(dp);
                return dockedY(dp, dock)
                    + (1 + 17 * rand * rand % 4) * Math.cos(absTime / (1.1 + rand * rand % 7));
            }

            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const circleEl = circleEls[i];
                circleEl.setAttribute("cx", getX(point).toString());
                circleEl.setAttribute("cy", getY(point).toString());
            }

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineEl = lineEls[i];
                lineEl.setAttribute("x1", getX(line[0]).toString());
                lineEl.setAttribute("y1", getY(line[0]).toString());
                lineEl.setAttribute("x2", getX(line[1]).toString());
                lineEl.setAttribute("y2", getY(line[1]).toString());
            }
        }

        tick(performance.now());
        return () => {
            if (handler === undefined) { return; }
            cancelAnimationFrame(handler);
        };
    });

    return <svg
        ref={ref}
        viewBox={`${dock.left} ${dock.top} ${w} ${h}`}
        {...props}
    >
        {points
            .map((dp, i) =>
                <circle key={i} fill={"#efcfff"} r={3}
                        cx={dockedX(dp, dock)} cy={dockedY(dp, dock)} />
            )}
        {lines.map((ps, i) => <line key={i} stroke={"#efcfff"} strokeWidth={1}
                                    x1={dockedX(ps[0], dock)} y1={dockedY(ps[0], dock)}
                                    x2={dockedX(ps[1], dock)} y2={dockedY(ps[1], dock)} />
        )}
    </svg>;
}
