import { mat3, vec2 } from "gl-matrix";
import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
type TRSOpts = {
    translation?: [number, number];
    rotation?: number;
    scale?: number;
};
declare class TexCoordTransform {
    readonly buffer: Float32Array;
    readonly translation: vec2;
    readonly scale: vec2;
    readonly rotation: Float32Array;
    decomposeMatrix(m: mat3): void;
    composeMat2(): Float32Array;
    getTransformHash(): number;
}
declare abstract class TexCoord extends Chunk {
    static create(attrib?: string): StaticTexCoord;
    static createTransformed(attrib?: string, matrix?: mat3): StaticTexCoord;
    static createFromTRS(attrib?: string, trsOpt?: TRSOpts): StaticTexCoord;
    static createTransformedDynamic(attrib?: string): DynamicTexCoord;
    readonly _transform: TexCoordTransform;
    readonly attrib: string;
    protected _uid: string;
    constructor(attrib: string | undefined, hasSetup: boolean);
    abstract varying(): string;
    abstract getTransformCode(): string;
    _genCode(slots: ChunksSlots): void;
}
export declare class DynamicTexCoord extends TexCoord {
    private readonly _translateInput;
    private readonly _rotateScalesInput;
    private readonly _translateUniform;
    private readonly _rotationScaleUniform;
    private static _UID;
    constructor(attrib?: string);
    varying(): string;
    getTransformCode(): string;
    translate(x: number, y: number): this;
    rotate(rad: number): this;
    scale(x: number, y?: number): this;
    setMatrix(m: mat3): void;
    updateTransform(): void;
}
export declare class StaticTexCoord extends TexCoord {
    private _translateInput?;
    private _rotateScalesInput?;
    private _translateConst?;
    private _rotateScalesConst?;
    constructor(attrib: string | undefined, matrix: mat3);
    varying(): string;
    getTransformCode(): string;
}
export default TexCoord;
