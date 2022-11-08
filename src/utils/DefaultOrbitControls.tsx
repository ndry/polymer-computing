import { useRef } from "react";
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import "./declareOrbitControls";


export function DefaultOrbitControls() {
    const renderer = useThree(three => three.gl);
    const camera = useThree(three => three.camera);

    const cameraControlsRef = useRef<OrbitControls>(null);
    useFrame(() => {
        const controls = cameraControlsRef.current!;
        controls.update();
    });

    return <orbitControls
        args={[camera, renderer.domElement]}
        ref={cameraControlsRef} />;
}
