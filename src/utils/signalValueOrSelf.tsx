import { JSX } from "preact";

export function signalValueOrSelf<T>(x: T | JSX.SignalLike<T> | undefined) {
    return x instanceof Object && "value" in x ? x.value : x;
}
