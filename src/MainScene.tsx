import { useRef } from "react";
import { DirectionalLight, Group, LinearFilter, NearestFilter, TextureFilter, Vector3 } from "three";
import { physicsTick } from "./physics";
import { World } from "./puzzle/terms";
import { sceneForWorld } from "./sceneForWorld";
import { useFrame } from '@react-three/fiber';
import { Floor } from "./Floor";

const gravity = new Vector3(0, 10, 0);
export function MainScene({
    world
}: {
    world: World;
}) {
    const lightRef = useRef<DirectionalLight>(null);
    useFrame(({ camera }) => {
        const light = lightRef.current!;

        light.position.set(1, 2, 0);
        camera.updateWorldMatrix(true, false);
        light.position.applyQuaternion(camera.quaternion);
    });

    const scene11Ref = useRef<Group>(null);
    useFrame(({ gl, scene, camera }, delta) => {
        scene11Ref.current!.remove(...scene11Ref.current!.children);

        const { scene: scene1, links, bodies } = sceneForWorld(gl, world);

        physicsTick({ dt: Math.min(delta, 0.1), gravity, bodies, links });

        scene11Ref.current!.add(scene1);

        gl.render(scene, camera);

    }, 1);

    const floorRadius = 15;
    return <>
        <directionalLight intensity={0.8} ref={lightRef} />
        <ambientLight intensity={0.1} />

        <group ref={scene11Ref} />

        <group>
            <Floor />

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -4.95, 0]}
            >
                <torusGeometry args={[16, 0.2, 10, 150]} />
                <meshPhongMaterial
                    color={"#bfa0ff"}
                    emissive={"#bfa0ff"}
                    emissiveIntensity={1}
                />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -4.95, 0]}
            >
                <torusGeometry args={[20, 0.2, 10, 150]} />
                <meshPhongMaterial
                    color={"#bfa0ff"}
                    emissive={"#bfa0ff"}
                    emissiveIntensity={1}
                />
            </mesh>
            {
                Array.from({ length: 5 }, (_, i) =>
                    <mesh
                        key={i}
                        rotation={[-Math.PI / 2, 0, Math.PI * -0.15]}
                        position={[0, i * 5, 0]}
                    >
                        <torusGeometry args={[floorRadius * (0.95 - i * .05), 0.1, 10, 150, Math.PI * 1.3]} />
                        <meshPhongMaterial
                            color={"#bfa0ff"}
                            emissive={"#bfa0ff"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>)
            }
        </group>
    </>;
}
