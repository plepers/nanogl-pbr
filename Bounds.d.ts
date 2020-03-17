import { vec3, mat4 } from "gl-matrix";
export declare class BoundingSphere {
    readonly center: vec3;
    readonly radius: vec3;
    static fromBounds(out: BoundingSphere, b: Bounds): void;
}
export default class Bounds {
    protected _mmData: Float32Array;
    readonly min: vec3;
    readonly max: vec3;
    constructor();
    zero(): void;
    copyFrom(b: Bounds): void;
    fromMinMax(min: number[] | Float32Array, max: number[] | Float32Array): void;
    static union(out: Bounds, a: Bounds, b: Bounds): void;
    static transform(out: Bounds, bounds: Bounds, matrix: mat4): void;
}
