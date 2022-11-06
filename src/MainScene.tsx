import { useEffect, useRef, useState } from "react";
import { DirectionalLight, Group, Material, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, RGBAFormat, RGBFormat, Vector3, WebGLRenderTarget } from "three";
import { physicsTick } from "./physics";
import { World } from "./puzzle/terms";
import { sceneForWorld } from "./sceneForWorld";
import { useFrame, useThree } from '@react-three/fiber';
import "./utils/orbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader";


const b = new WebGLRenderTarget(1024, 1024, { format: RGBAFormat });
const gravity = new Vector3(0, 10, 0);
export function MainScene({
    world
}: {
    world: World;
}) {
    const gl = useThree(three => three.gl);
    const scene = useThree(three => three.scene);


    const lightRef = useRef<DirectionalLight>(null);
    useFrame(({ camera }) => {
        const light = lightRef.current!;

        light.position.set(1, 2, 0);
        camera.updateWorldMatrix(true, false);
        light.position.applyQuaternion(camera.quaternion);
    });

    const scene11Ref = useRef<Group>(null);


    const floorCameraRef = useRef<OrthographicCamera>(null);


    const [composer, setComposer] = useState<EffectComposer>();
    useEffect(() => {
        const composer = new EffectComposer(
            gl,
            b);

        composer.addPass(new RenderPass(scene, floorCameraRef.current!));
        composer.addPass(new ShaderPass(VerticalBlurShader));
        composer.addPass(new ShaderPass(VerticalBlurShader));
        composer.addPass(new ShaderPass(VerticalBlurShader));
        composer.addPass(new ShaderPass(VerticalBlurShader));
        const vblur = new ShaderPass(VerticalBlurShader);
        vblur.renderToScreen = true;
        composer.addPass(vblur);

        setComposer(composer);

    }, [gl, scene, floorCameraRef.current]);


    useFrame(({ scene, gl }) => {

    });

    useFrame(({ gl, scene, camera }, delta) => {
        scene11Ref.current!.remove(...scene11Ref.current!.children);

        const { scene: scene1, links, bodies } = sceneForWorld(gl, world);

        physicsTick({ dt: delta, gravity, bodies, links });

        scene11Ref.current!.add(scene1);
        gl.render(scene, camera);

        composer?.render();

        gl.render(scene, camera);
    }, 1);

    const floorRadius = 15;
    return <>
        <directionalLight intensity={1} ref={lightRef} />
        <ambientLight intensity={0.1} />

        <group ref={scene11Ref} />

        <group>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -5.1, 0]}
            >
                <circleGeometry args={[floorRadius, 50]} />
                <meshBasicMaterial
                    color={"white"}
                    transparent={true}
                    opacity={0.01}
                />
            </mesh>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -5, 0]}
            >
                <circleGeometry args={[floorRadius, 50]} />
                <meshBasicMaterial
                    map={b.texture}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>
            {
                Array.from({ length: 5 }, (_, i) =>
                    <mesh
                        key={i}
                        rotation={[-Math.PI / 2, 0, Math.PI * -0.15]}
                        position={[0, i * 5, 0]}
                    >
                        <torusGeometry args={[floorRadius * (0.95 - i * .05), 0.2, 4, 150, Math.PI * 1.3]} />
                        <meshPhongMaterial
                            color={"#bfa0ff"}
                            emissive={"#bfa0ff"}
                            emissiveIntensity={1}
                        />
                    </mesh>)
            }
            <orthographicCamera
                ref={floorCameraRef}
                args={[-floorRadius, floorRadius, -floorRadius, floorRadius]}
                rotation={[Math.PI / 2, 0, 0]} />
        </group>


    </>;
}
