import Texture2D from 'nanogl/texture-2d';
import Chunk from './Chunk';
import Swizzle from './Swizzle';
import ChunkSlots from './ChunksSlots';
import Program from 'nanogl/program';
export declare enum ShaderType {
    FRAGMENT = 1,
    VERTEX = 2,
    ALL = 3
}
declare type InputSize = 1 | 2 | 3 | 4;
export interface IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
}
declare type InputParam = IInputParam & Chunk;
export declare class Sampler extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    _tex: Texture2D | null;
    _linkAttrib: boolean;
    texCoords: string | Attribute;
    uvsToken: string;
    constructor(name: string, texCoords: Attribute | string);
    set(t: Texture2D): void;
    _genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
    _getHash(): string;
}
export declare class Uniform extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    _value: Float32Array;
    constructor(name: string, size: InputSize);
    set(...args: number[]): void;
    _genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
    _getHash(): string;
}
export declare class Attribute extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    constructor(name: string, size: InputSize);
    _genCode(slots: ChunkSlots): void;
    _getHash(): string;
}
export declare class Constant extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    value: ArrayLike<number> | number;
    constructor(value: ArrayLike<number> | number);
    _genCode(slots: ChunkSlots): void;
    _stringifyValue(): string;
    _getHash(): string;
}
export default class Input extends Chunk {
    static readonly Sampler: typeof Sampler;
    static readonly Uniform: typeof Uniform;
    static readonly Attribute: typeof Attribute;
    static readonly Constant: typeof Constant;
    static readonly FRAGMENT: ShaderType;
    static readonly VERTEX: ShaderType;
    static readonly ALL: ShaderType;
    readonly name: string;
    readonly size: InputSize;
    readonly shader: ShaderType;
    comps: Swizzle;
    param: InputParam | null;
    constructor(name: string, size: InputSize, shader?: ShaderType);
    attach(param: InputParam, comps?: Swizzle): void;
    detach(): void;
    attachSampler(name: string, texCoords: string, comps?: Swizzle): Sampler;
    attachUniform(name: string, size?: InputSize, comps?: Swizzle): Uniform;
    attachAttribute(name: string, size?: InputSize, comps?: Swizzle): Attribute;
    attachConstant(value: ArrayLike<number> | number, comps?: Swizzle): Constant;
    _getHash(): string;
    _genCode(slots: ChunkSlots): void;
    genAvailable(slots: ChunkSlots): void;
}
export {};
