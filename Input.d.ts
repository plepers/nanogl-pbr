import Texture2D from 'nanogl/texture-2d';
import Chunk from './Chunk';
import Swizzle from './Swizzle';
import ChunksSlots from './ChunksSlots';
import Program from 'nanogl/program';
import { Hash } from './Hash';
import TexCoord from './TexCoord';
import { ColorSpace } from './ColorSpace';
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
    genInputCode(slots: ChunksSlots, input: Input): void;
}
declare type InputParam = Sampler | Uniform | Attribute | Constant;
export declare abstract class BaseParams extends Chunk {
    protected _colorspace: ColorSpace;
    constructor(hasCode?: boolean, hasSetup?: boolean);
    set colorspace(c: ColorSpace);
    get colorspace(): ColorSpace;
}
export declare class Sampler extends BaseParams implements IInputParam {
    readonly ptype: ParamType.SAMPLER;
    name: string;
    size: InputSize;
    token: string;
    _tex: Texture2D | null;
    texCoords: TexCoord | string;
    _varying: string;
    constructor(name: string, texCoords?: TexCoord | string, colorspace?: ColorSpace);
    set(t: Texture2D): void;
    protected _genCode(slots: ChunksSlots): void;
    genInputCode(slots: ChunksSlots, input: Input): void;
    setup(prg: Program): void;
    private static colorSpaceTransformCode;
}
export declare class Uniform extends BaseParams implements IInputParam {
    readonly ptype: ParamType.UNIFORM;
    readonly name: string;
    readonly size: InputSize;
    token: string;
    private _value;
    get value(): Float32Array;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    constructor(name: string, size: InputSize);
    set(...args: number[]): void;
    protected _genCode(slots: ChunksSlots): void;
    genInputCode(slots: ChunksSlots, input: Input): void;
    setup(prg: Program): void;
    static colorSpaceTransformCode(from: ColorSpace, to: ColorSpace, d: string, v: string): string;
}
export declare class Attribute extends BaseParams implements IInputParam {
    readonly ptype: ParamType.ATTRIBUTE;
    name: string;
    size: InputSize;
    token: string;
    constructor(name: string, size: InputSize);
    protected _genCode(slots: ChunksSlots): void;
    genInputCode(slots: ChunksSlots, input: Input): void;
}
export declare class Constant extends BaseParams implements IInputParam {
    readonly ptype: ParamType.CONSTANT;
    name: string;
    size: InputSize;
    token: string;
    value: ArrayLike<number> | number;
    _hash: Hash;
    constructor(value: ArrayLike<number> | number);
    set(value: ArrayLike<number> | number): void;
    protected _genCode(slots: ChunksSlots): void;
    genInputCode(slots: ChunksSlots, input: Input): void;
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
    private _colorspace;
    comps: Swizzle;
    param: InputParam | null;
    constructor(name: string, size: InputSize, shader?: ShaderType, colorspace?: ColorSpace);
    set colorspace(c: ColorSpace);
    get colorspace(): ColorSpace;
    attach(param: InputParam | null, comps?: Swizzle): void;
    detach(): void;
    attachSampler(name?: string, texCoords?: string | TexCoord, comps?: Swizzle): Sampler;
    attachUniform(name?: string, size?: InputSize, comps?: Swizzle): Uniform;
    attachAttribute(name?: string, size?: InputSize, comps?: Swizzle): Attribute;
    attachConstant(value: ArrayLike<number> | number, comps?: Swizzle): Constant;
    _genCode(slots: ChunksSlots): void;
}
export {};
