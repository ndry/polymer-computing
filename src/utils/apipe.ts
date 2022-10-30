export function pipe<T>(): (s: T) => T;
export function pipe<T, T2>(
    f1: (s: T) => T2,
): (s: T) => T2;
export function pipe<T, T2, T3>(
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
): (s: T) => T3;
export function pipe<T, T2, T3, T4>(
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
): (s: T) => T4;
export function pipe<T, T2, T3, T4, T5>(
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
): (s: T) => T5;
export function pipe<T, T2, T3, T4, T5, T6>(
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
    f5: (s: T5) => T6,
): (s: T) => T6;
export function pipe<T, T2, T3, T4, T5, T6, Ts>(
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
    f5: (s: T5) => T6,
    ...fs: Array<(s: T6 | Ts) => Ts>
): (s: T) => Ts;
export function pipe<T>(
    ...fs: Array<(s: T) => T>
): (s: T) => T;
export function pipe<T>(...fns: Array<(x: T) => T>) {
    return (x: T) => fns.reduce(apply, x);
}

export const apply = <T, U>(x: T, fn: (s: T) => U) => fn(x);

export function apipe<T>(x: T): T;
export function apipe<T, T2>(
    x: T,
    f1: (s: T) => T2,
): T2;
export function apipe<T, T2, T3>(
    x: T,
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
): T3;
export function apipe<T, T2, T3, T4>(
    x: T,
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
): T4;
export function apipe<T, T2, T3, T4, T5>(
    x: T,
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
): T5;
export function apipe<T, T2, T3, T4, T5, T6>(
    x: T,
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
    f5: (s: T5) => T6,
): T6;
export function apipe<T, T2, T3, T4, T5, T6, Ts>(
    x: T,
    f1: (s: T) => T2,
    f2: (s: T2) => T3,
    f3: (s: T3) => T4,
    f4: (s: T4) => T5,
    f5: (s: T5) => T6,
    ...fs: Array<(s: T6 | Ts) => Ts>
): Ts;
export function apipe<T>(
    x: T,
    ...fs: Array<(s: T) => T>
): T;
export function apipe<T>(x: T, ...fns: Array<(x: T) => T>) {
    // return apply(x, pipe(...fns));
    return fns.reduce((x, fn) => fn(x), x);
}