export default class Bounds {
    min: Float32Array;
    max: Float32Array;
    center: Float32Array;
    radius: Float32Array;
    constructor();
    fromMinMax(min: number[] | Float32Array, max: number[] | Float32Array): void;
    addMinMax(min: number[] | Float32Array, max: number[] | Float32Array): void;
    addBounds(b: Bounds): void;
    _updateSphere(): void;
}
