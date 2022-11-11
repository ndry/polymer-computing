import { MouseEventHandler } from "react";
import { StateTuple } from "./StateTuple";

export function cyclicSelectorMixin<T, Element>(
    values: readonly T[],
    [value, setValue]: StateTuple<T>) {
    return {
        onMouseUp: (ev => {
            let i = values.indexOf(value);
            if (ev.button === 2) { i--; }
            else if (ev.button === 1) { i = 0; }
            else { i++; }

            setValue(values.at(i % values.length)!);

            ev.preventDefault();
        }) as MouseEventHandler<Element>,
        onMouseDown: (ev => ev.preventDefault()) as MouseEventHandler<Element>,
        onContextMenu: (ev => ev.preventDefault()) as MouseEventHandler<Element>,
    };
}
