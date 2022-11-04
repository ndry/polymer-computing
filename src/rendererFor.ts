import {
    WebGLRenderer, PerspectiveCamera, Scene,
    DirectionalLight,
    AmbientLight,
    Color,
    Object3D,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mixAddTap } from "./utils/mixAddTap";
import memoizee from "memoizee";

export const rendererFor = memoizee(canvas => {
    const renderer = new WebGLRenderer({
        antialias: true,
        canvas,
    });

    const scene = new class extends mixAddTap(Scene) {
        background = new class extends Color {
            constructor() {
                super();
                this.setStyle(document.body.style.backgroundColor);
            }
        }()

        directionalLight = this.addTap(new DirectionalLight(), obj => {
            obj.intensity = 0.2;
        })

        ambientLight = this.addTap(new AmbientLight(), obj => {
            obj.intensity = 0.85;
        })
    }();

    const camera = new PerspectiveCamera(70, 0.1, 0.01, 1000);
    camera.position.set(5, 15, 15);
    scene.add(camera);
    camera.add(scene.directionalLight);
    scene.directionalLight.position.set(5, -5, 0);

    const controls = new OrbitControls(camera, renderer.domElement);

    return {
        renderer,
        scene,
        camera,
        controls,
        render: (g: Object3D) => {
            const r = canvas.getBoundingClientRect();
            renderer.setSize(r.width, r.height, false);
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            controls.update();
            scene.add(g);
            renderer.render(scene, camera);
            scene.remove(g);
        }
    }
});