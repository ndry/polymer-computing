// based on
// https://github.com/mrdoob/three.js/blob/f021ec0c9051eb11d110b0c2b93305bffd0942e0/examples/jsm/postprocessing/EffectComposer.js

import {
    WebGLRenderer,
    WebGLRenderTarget
} from 'three';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { MaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';
import { ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';


function isLastEnabled(passes: ReadonlyArray<{ enabled: any }>, passIndex: number) {
    for (let i = passIndex + 1; i < passes.length; i++) {
        if (passes[i].enabled) { return false; }
    }
    return true;
}
const copyPass = new ShaderPass(CopyShader);

export function renderPasses(
    passes: readonly Pass[],
    renderer: WebGLRenderer,
    renderTarget1: WebGLRenderTarget,
    renderTarget2: WebGLRenderTarget,
    renderToScreen: boolean = true,
    deltaTime: number,
) {
    let writeBuffer = renderTarget1;
    let readBuffer = renderTarget2;

    const currentRenderTarget = renderer.getRenderTarget();

    let maskActive = false;

    for (let i = 0, il = passes.length; i < il; i++) {
        const pass = passes[i];
        if (pass.enabled === false) continue;

        pass.setSize(renderTarget1.width, renderTarget1.height);
        pass.renderToScreen = (renderToScreen && isLastEnabled(passes, i));
        pass.render(
            renderer,
            writeBuffer,
            readBuffer,
            deltaTime,
            maskActive);

        if (pass.needsSwap) {
            if (maskActive) {
                const context = renderer.getContext();
                const stencil = renderer.state.buffers.stencil;

                //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
                stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

                copyPass.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);

                //context.stencilFunc( context.EQUAL, 1, 0xffffffff );
                stencil.setFunc(context.EQUAL, 1, 0xffffffff);
            }

            // swap buffers
            const tmp = readBuffer;
            readBuffer = writeBuffer;
            writeBuffer = tmp;
        }

        if (MaskPass !== undefined) {
            if (pass instanceof MaskPass) {
                maskActive = true;
            } else if (pass instanceof ClearMaskPass) {
                maskActive = false;
            }
        }

    }

    renderer.setRenderTarget(currentRenderTarget);

    return readBuffer;
}