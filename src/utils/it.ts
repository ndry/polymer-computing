import { apply } from "./apipe";

export const map = <T, U>(f: (x: T) => U) =>
    function* (s: Iterable<T>) { for (const x of s) yield f(x); }

export const flat = <TIter extends Iterable<any>>() =>
    function* (s: Iterable<TIter>): Iterable<TIter extends Iterable<infer T> ? T : never> {
        for (const x of s) yield* x;
    }

export const tap = <T, U>(f: (x: T) => U) =>
    function* (s: Iterable<T>) { for (const x of s) { f(x); yield x } }

export const filter = <T>(f: (x: T) => unknown) =>
    function* (s: Iterable<T>) { for (const x of s) if (f(x)) yield x; }

export const take = <T>(count: number) => function* (s: Iterable<T>) {
    if (--count < 0) { return; }
    for (const x of s) {
        yield x;
        if (--count < 0) { return; }
    }
}

export function* repeat<T>(x: T) { while (true) { yield x; } }

export const scan = <TAccumulator, TValue>(
    reducer: (acc: TAccumulator, x: TValue) => TAccumulator,
    seed: TAccumulator
) => function* (s: Iterable<TValue>) { for (const x of s) yield seed = reducer(seed, x); }


export const first = <T>() =>
    (s: Iterable<T>) => { for (const x of s) { return x; } };

export const last = <T>() => (s: Iterable<T>) => {
    let _last = undefined as T | undefined;
    for (const x of s) {
        _last = x;
    }
    return _last;
};

export function* inf() { for (let i = 0; true; i++) { yield i; } }


export const reiterable = <T>(s: Iterable<T> | T[]) => {
    let _s = Array.isArray(s) ? s : undefined;
    return () => {
        if (!_s) {
            _s = [];
            return (function* () {
                for (const x of s) {
                    yield x;
                    _s!.push(x);
                }
            })();
        }
        return _s!;
    }
}

export const concat = <T>(...sources: Iterable<T>[]) => apply(sources, flat());


export function* cross<T, U>(s1: Iterable<T>, s2: Iterable<U>) {
    const _s2 = reiterable(s2);
    for (const x1 of s1) for (const x2 of _s2()) yield [x1, x2] as [T, U];
}
export function* cross3<T, U, R>(s1: Iterable<T>, s2: Iterable<U>, s3: Iterable<R>) {
    const _s2 = reiterable(s2);
    const _s3 = reiterable(s3);
    for (const x1 of s1) for (const x2 of _s2()) for (const x3 of _s3()) yield [x1, x2, x3] as [T, U, R];
}
