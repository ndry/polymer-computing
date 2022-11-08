import { useEffect, useRef } from "react";
import { Mesh, PerspectiveCamera, RGBAFormat, WebGLRenderTarget } from "three";
import { renderPasses } from "./utils/renderPasses";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader";
import { reflectCamera, ReflectorMaterial, updateTextureMatrix } from "./utils/reflector";


export function Floor() {

    const floorRef = useRef<Mesh>(null);

    useEffect(() => {
        const floor = floorRef.current!;

        const b = new WebGLRenderTarget(512, 512, {
            samples: 4,
            format: RGBAFormat,
        });
        const b2 = b.clone();
        const floorCamera = new PerspectiveCamera();
        const passes = [
            // @ts-ignore: scene and camera are set just before rendering
            new RenderPass(),
            (() => {
                const p = new ShaderPass(VerticalBlurShader);
                p.uniforms.v.value = 1 / b.height;
                return p;
            })(),
            (() => {
                const p = new ShaderPass(HorizontalBlurShader);
                p.uniforms.h.value = 1 / b.width;
                return p;
            })(),
        ] as const;

        const m = new ReflectorMaterial();
        m.uniforms.tDiffuse.value = b2.texture;
        floor.material = m;

        floor.onBeforeRender = (gl, scene, camera) => {
            const shouldRender = reflectCamera(
                floor, camera as PerspectiveCamera, floorCamera, 0);
            if (!shouldRender) { return; }

            floor.visible = false;
            passes[0].scene = scene;
            passes[0].camera = floorCamera;
            const lastBuffer = renderPasses(passes, gl, b, b2, false, 0);
            m.uniforms.tDiffuse.value = lastBuffer.texture;
            floor.visible = true;

            updateTextureMatrix(floor, floorCamera, m.uniforms.textureMatrix.value);
        };

        return () => {
            m.dispose();
            b.dispose();
            b2.dispose();
        };
    }, [floorRef.current]);

    return <>
        <mesh
            ref={floorRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -5, 0]}
        >
            <circleGeometry args={[20, 50]} />

            <mesh
                position={[0, 0, 0.1]}
            >
                <circleGeometry args={[20, 50]} />
                <meshBasicMaterial
                    color={"black"}
                    transparent={true}
                    opacity={0.6} />
            </mesh>
            <mesh
                rotation={[-Math.PI, 0, 0]}
                position={[0, 0, -0.1]}
            >
                <circleGeometry args={[20, 50]} />
                <meshBasicMaterial
                    color={"black"}
                    transparent={true}
                    opacity={0.9} />
            </mesh>
        </mesh>
    </>;
}
