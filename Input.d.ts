import Texture2D from 'nanogl/texture-2d';
import Chunk from './Chunk';
import Swizzle from './Swizzle';
import ChunkSlots from './ChunksSlots';
import Program from 'nanogl/program';
import { Hash } from './Hash';
import TexCoord from './TexCoord';
export declare enum ShaderType {
    FRAGMENT = 1,
    VERTEX = 2,
    ALL = 3
}
declare type InputSize = 1 | 2 | 3 | 4;
declare enum ParamType {
    SAMPLER = 0,
    UNIFORM = 1,
    ATTRIBUTE = 2,
    CONSTANT = 3
}
export interface IInputParam {
    readonly ptype: ParamType;
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
}
declare type InputParam = Sampler | Uniform | Attribute | Constant;
export declare class Sampler extends Chunk implements IInputParam {
    readonly ptype: ParamType.SAMPLER;
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    _tex: Texture2D | null;
    texCoords: TexCoord | string;
    _varying: string;
    constructor(name: string, texCoords: TexCoord | string);
    set(t: Texture2D): void;
    _genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
}
export declare class Uniform extends Chunk implements IInputParam {
    readonly ptype: ParamType.UNIFORM;
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    _value: Float32Array;
    constructor(name: string, size: InputSize);
    set(...args: number[]): void;
    _genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
}
export declare class Attribute extends Chunk implements IInputParam {
    readonly ptype: ParamType.ATTRIBUTE;
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    constructor(name: string, size: InputSize);
    _genCode(slots: ChunkSlots): void;
}
export declare class Constant extends Chunk implements IInputParam {
    readonly ptype: ParamType.CONSTANT;
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    value: ArrayLike<number> | number;
    _hash: Hash;
    constructor(value: ArrayLike<number> | number);
    _genCode(slots: ChunkSlots): void;
    _stringifyValue(): string;
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
    attachSampler(name: string, texCoords: string | TexCoord, comps?: Swizzle): Sampler;
    attachUniform(name: string, size?: InputSize, comps?: Swizzle): Uniform;
    attachAttribute(name: string, size?: InputSize, comps?: Swizzle): Attribute;
    attachConstant(value: ArrayLike<number> | number, comps?: Swizzle): Constant;
    _genCode(slots: ChunkSlots): void;
}
export {};
