import { Object3D } from 'three';

export function mixAddTap<T extends new (...args: any[]) => Object3D>(x: T) {
    return class extends x {
        addTap<T extends Object3D>(obj: T, tapFn?: (obj: T) => unknown) {
            this.add(obj);
            tapFn?.(obj);
            return obj;
        }
    };
}
