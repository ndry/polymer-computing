import { useRef } from "react";
import { DirectionalLight, Group, Vector3 } from "three";
import { physicsTick } from "./physics";
import { World } from "./puzzle/terms";
import { sceneForWorld } from "./sceneForWorld";
import { useFrame } from '@react-three/fiber';
import "./utils/orbitControls";

const gravity = new Vector3(0, -9.81, 0);
export function MainScene({
    world
}: {
    world: World;
}) {
    const lightRef = useRef<DirectionalLight>(null);
    useFrame(({ camera }) => {
        const light = lightRef.current!;

        light.position.set(1, 1, 3);
        camera.updateWorldMatrix(true, false);
        light.position.applyQuaternion(camera.quaternion);
    });

    const scene11Ref = useRef<Group>(null);

    useFrame(({ gl: renderer }, delta) => {
        scene11Ref.current!.remove(...scene11Ref.current!.children);

        const { scene: scene1, links, bodies } = sceneForWorld(renderer, world);

        physicsTick({ dt: delta, gravity, bodies, links });

        scene11Ref.current!.add(scene1);
    })

    return <>
        <directionalLight intensity={0.5} ref={lightRef} />
        <ambientLight intensity={0.45} />

        <group ref={scene11Ref} />
    </>;
}
