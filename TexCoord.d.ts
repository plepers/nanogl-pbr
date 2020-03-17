import { mat3, vec2 } from "gl-matrix";
import Chunk from "./Chunk";
import ChunkSlots from "./ChunksSlots";
import Input from "./Input";
export declare abstract class TexCoordTransform extends Chunk {
    private static _UID;
    readonly attrib: string;
    readonly _translateInput: Input;
    readonly _rotateScalesInput: Input;
    _translation: vec2;
    _scale: vec2;
    _rotation: number;
    protected _uid: string;
    constructor(attrib: string, hasSetup: boolean);
    protected _genCode(slots: ChunkSlots): void;
    varying(): string;
    protected _getHash(): string;
    protected decomposeMatrix(m: mat3): void;
    abstract updateTransform(): void;
}
export declare class DynamicTexCoordTransform extends TexCoordTransform {
    private readonly _translateUniform;
    private readonly _rotationScaleUniform;
    constructor(attrib: string);
    translate(x: number, y: number): this;
    rotate(rad: number): this;
    scale(x: number, y?: number): this;
    setMatrix(m: mat3): void;
    updateTransform(): void;
}
export declare class StaticTexCoordTransform extends TexCoordTransform {
    _matrix: mat3;
    constructor(attrib: string, matrix: mat3);
    updateTransform(): void;
    equalMatrix(m: mat3): boolean;
}
export default class TexCoord extends Chunk {
    readonly attrib: string;
    readonly _statics: StaticTexCoordTransform[];
    private _identity;
    constructor(attrib?: string);
    addTransform(): DynamicTexCoordTransform;
    addStaticTransform(matrix: mat3): StaticTexCoordTransform;
    varying(): string;
    private getStaticTransform;
    protected _genCode(slots: ChunkSlots): void;
    protected _getHash(): string;
}
