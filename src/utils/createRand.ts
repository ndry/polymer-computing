import SHA256 from "crypto-js/sha256";

export function createRand(seed: string) {
    let arr = SHA256(seed).words;
    const randUInt32 = () => {
        if (arr.length === 1) { arr = SHA256(arr.shift()!.toString()).words; }
        return (arr.shift()! >>> 0);
    };
    const rand = Object.assign(() => randUInt32() / (~0 >>> 0), {
        uint32: randUInt32,
        rangeInt: (maxExcl: number) => Math.floor(rand() * maxExcl),
        el: <T>(arr: T[]) => arr[rand.rangeInt(arr.length)],
    })
    return rand;
}
