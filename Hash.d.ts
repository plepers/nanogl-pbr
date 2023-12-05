export type Hash = number;
export declare function hashString(str: string, hash?: Hash): Hash;
export declare function hashNumber(n: number, hash?: Hash): Hash;
export declare function mergeHash(h1: Hash, h2: Hash): number;
export declare function hashView(a: ArrayBufferView, hash?: Hash): Hash;
export declare function stringifyHash(h: Hash): string;
export declare class HashBuilder {
    private _hash;
    start(): this;
    hashString(str: string): this;
    hashNumber(n: number): this;
    hashView(a: ArrayBufferView): this;
    get(): Hash;
}
declare const hashBuilder: HashBuilder;
export default hashBuilder;
