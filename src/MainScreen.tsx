import { css, cx } from "@emotion/css";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { physicsTick } from "./physics";
import { World } from "./puzzle/terms";
import { sceneForWorld } from "./sceneForWorld";
import { rendererFor } from "./rendererFor";
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';


export function MainScreen({
    world, className, ...props
}: {
    world: World;
} & Omit<JSX.IntrinsicElements["canvas"], "ref">) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) { return; }

        const { render } = rendererFor(canvasRef.current);
        const { scene, links, bodies } = sceneForWorld(render, world);
        const gravity = new Vector3(0, -9.81, 0);

        let handler: number;
        let lastTimeMs = performance.now();
        const tick = (timeMs: number) => {
            const dt = Math.min(0.1, (timeMs - lastTimeMs) / 1000);

            physicsTick({ dt, gravity, bodies, links });
            render(scene);

            lastTimeMs = timeMs;
            handler = requestAnimationFrame(tick);
        };
        tick(performance.now());
        return () => cancelAnimationFrame(handler);
    }, [canvasRef.current, world]);

    return <canvas
        className={cx(
            css({}),
            className
        )}
        ref={canvasRef}
        {...props}
    ></canvas>;
}
