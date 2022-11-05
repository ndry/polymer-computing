import { css, cx } from "@emotion/css";
import { useEffect, useRef } from "react";
import { DirectionalLight, Vector3 } from "three";
import { physicsTick } from "./physics";
import { World } from "./puzzle/terms";
import { sceneForWorld } from "./sceneForWorld";
import { useFrame, useThree } from '@react-three/fiber';
import "./utils/orbitControls";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export function MainScreen({
    world
}: {
    world: World;
}) {
    const renderer = useThree(three => three.gl);
    const scene = useThree(three => three.scene);
    const camera = useThree(three => three.camera);

    const lightRef = useRef<DirectionalLight>(null);
    const cameraControlsRef = useRef<OrbitControls>(null);

    useFrame(({ camera }) => {
        const light = lightRef.current;
        if (!light) { return; }
        light.position.set(5, -5, 0);
        light.position.add(camera.position);
    })

    useFrame(() => {
        const controls = cameraControlsRef.current;
        if (!controls) { return; }
        controls.update();
    })

    useEffect(() => {
        const { scene: scene1, links, bodies } = sceneForWorld(renderer, world);
        const gravity = new Vector3(0, -9.81, 0);

        let handler: number;
        let lastTimeMs = performance.now();
        const tick = (timeMs: number) => {
            const dt = Math.min(0.1, (timeMs - lastTimeMs) / 1000);

            physicsTick({ dt, gravity, bodies, links });

            scene.add(scene1);
            renderer.render(scene, camera);
            scene.remove(scene1);

            lastTimeMs = timeMs;
            handler = requestAnimationFrame(tick);
        };
        tick(performance.now());
        return () => cancelAnimationFrame(handler);
    }, [renderer, scene, camera, world]);

    return <>
        <directionalLight
            intensity={0.4}
            ref={lightRef}
        />

        <orbitControls
            args={[camera, renderer.domElement]}
            ref={cameraControlsRef}
        />

        <ambientLight intensity={0.65} />
    </>;
}
