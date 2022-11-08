
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { extend, Node } from '@react-three/fiber';

extend({ OrbitControls });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            orbitControls: Node<OrbitControls, typeof OrbitControls>,
        }
    }
}
