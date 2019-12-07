import Texture from 'nanogl/texture';
import Chunk from './chunk';
import Swizzle from './swizzle';
import ChunkSlots from './chunks-slots';
import Program from 'nanogl/program';
export declare const enum ShaderType {
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
    _tex: Texture | null;
    _linkAttrib: boolean;
    texCoords: string | Attribute;
    uvsToken: string;
    constructor(name: string, texCoords: Attribute | string);
    set(t: Texture): void;
    genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
    getHash(): string;
}
export declare class Uniform extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    _value: Float32Array;
    constructor(name: string, size: InputSize);
    set(): void;
    genCode(slots: ChunkSlots): void;
    setup(prg: Program): void;
    getHash(): string;
}
export declare class Attribute extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    constructor(name: string, size: InputSize);
    genCode(slots: ChunkSlots): void;
    getHash(): string;
}
export declare class Constant extends Chunk implements IInputParam {
    name: string;
    size: InputSize;
    token: string;
    _input: Input | null;
    value: ArrayLike<number> | number;
    constructor(value: ArrayLike<number> | number);
    genCode(slots: ChunkSlots): void;
    _stringifyValue(): string;
    getHash(): string;
}
export default class Input extends Chunk {
    static readonly Sampler: typeof Sampler;
    static readonly Uniform: typeof Uniform;
    static readonly Attribute: typeof Attribute;
    static readonly Constant: typeof Constant;
    static readonly FRAGMENT: ShaderType;
    static readonly VERTEX: ShaderType;
    static readonly ALL: ShaderType;
    name: string;
    size: InputSize;
    shader: ShaderType;
    comps: Swizzle;
    param: InputParam | null;
    constructor(name: string, size: InputSize, shader?: ShaderType);
    attach(param: InputParam, comps?: Swizzle): void;
    detach(): void;
    attachSampler(name: string, texCoords: string, comps?: Swizzle): Sampler;
    attachUniform(name: string, size?: InputSize, comps?: Swizzle): Uniform;
    attachAttribute(name: string, size?: InputSize, comps?: Swizzle): Attribute;
    attachConstant(value: ArrayLike<number> | number, comps?: Swizzle): Constant;
    getHash(): string;
    genCode(slots: ChunkSlots): void;
    genAvailable(slots: ChunkSlots): void;
}
export {};
