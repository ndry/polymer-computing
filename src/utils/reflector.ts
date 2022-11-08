// based on
// https://github.com/mrdoob/three.js/blob/f021ec0c9051eb11d110b0c2b93305bffd0942e0/examples/jsm/objects/Reflector.js

import {
    Matrix4,
    PerspectiveCamera,
    Plane,
    ShaderMaterial,
    Vector3,
    Vector4,
    WebGLRenderTarget,
    NoToneMapping,
    LinearEncoding,
    Object3D,
    IUniform,
    Texture,
    Camera,
    WebGLRenderer,
    Scene,
} from 'three';

export const reflectCamera = (() => {
    const reflectorWorldPosition = new Vector3();
    const cameraWorldPosition = new Vector3();
    const rotationMatrix = new Matrix4();
    const normal = new Vector3();
    const lookAtPosition = new Vector3();
    const target = new Vector3();
    const view = new Vector3();
    const reflectorPlane = new Plane();
    const clipPlane = new Vector4();
    const q = new Vector4();

    return (
        reflector: Object3D,
        camera: PerspectiveCamera,
        reflectedCamera: PerspectiveCamera,
        clipBias: number,
    ) => {
        reflectorWorldPosition.setFromMatrixPosition(reflector.matrixWorld);
        cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        rotationMatrix.extractRotation(reflector.matrixWorld);

        normal.set(0, 0, 1);
        normal.applyMatrix4(rotationMatrix);

        view.subVectors(reflectorWorldPosition, cameraWorldPosition);

        // Avoid rendering when reflector is facing away
        if (view.dot(normal) > 0) return;

        view.reflect(normal).negate();
        view.add(reflectorWorldPosition);

        rotationMatrix.extractRotation(camera.matrixWorld);

        lookAtPosition.set(0, 0, -1);
        lookAtPosition.applyMatrix4(rotationMatrix);
        lookAtPosition.add(cameraWorldPosition);

        target.subVectors(reflectorWorldPosition, lookAtPosition);
        target.reflect(normal).negate();
        target.add(reflectorWorldPosition);

        reflectedCamera.position.copy(view);
        reflectedCamera.up.set(0, 1, 0);
        reflectedCamera.up.applyMatrix4(rotationMatrix);
        reflectedCamera.up.reflect(normal);
        reflectedCamera.lookAt(target);

        reflectedCamera.far = camera.far; // Used in WebGLBackground

        reflectedCamera.updateMatrixWorld();
        reflectedCamera.projectionMatrix.copy(camera.projectionMatrix);

        // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
        // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
        reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
        reflectorPlane.applyMatrix4(reflectedCamera.matrixWorldInverse);


        clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);

        const projectionMatrix = reflectedCamera.projectionMatrix;

        q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        q.z = - 1.0;
        q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = clipPlane.x;
        projectionMatrix.elements[6] = clipPlane.y;
        projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
        projectionMatrix.elements[14] = clipPlane.w;

        return true;
    };
})();

export function renderReflectorTexture(
    renderer: WebGLRenderer,
    scene: Scene,
    virtualCamera: PerspectiveCamera,
    renderTarget: WebGLRenderTarget,
) {

    // Save renderer state
    const currentRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    const currentOutputEncoding = renderer.outputEncoding;
    const currentToneMapping = renderer.toneMapping;

    // Render
    renderer.xr.enabled = false; // Avoid camera modification
    renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
    renderer.outputEncoding = LinearEncoding;
    renderer.toneMapping = NoToneMapping;
    renderer.setRenderTarget(renderTarget);
    renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897
    if (renderer.autoClear === false) renderer.clear();
    renderer.render(scene, virtualCamera);

    // Restore renderer state
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.outputEncoding = currentOutputEncoding;
    renderer.toneMapping = currentToneMapping;
    renderer.setRenderTarget(currentRenderTarget);

    // Restore viewport
    // const viewport = camera.viewport;
    // if (viewport !== undefined) { renderer.state.viewport(viewport); }
}

export function updateTextureMatrix(
    reflectorObj: Object3D,
    reflectedCamera: Camera,
    targetMatrix: Matrix4,
) {
    targetMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
    );
    targetMatrix.multiply(reflectedCamera.projectionMatrix);
    targetMatrix.multiply(reflectedCamera.matrixWorldInverse);
    targetMatrix.multiply(reflectorObj.matrixWorld);
}


export class ReflectorMaterial extends ShaderMaterial {

    uniforms = {
        'textureMatrix': { value: new Matrix4() },
        'tDiffuse': { value: null } as IUniform<Texture | null>,
    }

    vertexShader = /* glsl */`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>

		void main() {
			vUv = textureMatrix * vec4( position, 1.0 );
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`

    fragmentShader = /* glsl */`
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		void main() {
			gl_FragColor = texture2DProj( tDiffuse, vUv );
            
			#include <tonemapping_fragment>
			#include <encodings_fragment>
		}`
};

