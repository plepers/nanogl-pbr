import { vec3 } from 'gl-matrix';
import Program from 'nanogl/program';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';
export declare type IblBoxProjection = {
    center: vec3;
    min: vec3;
    max: vec3;
};
export default class Ibl extends Light {
    env?: import("nanogl/texture-cube").default | import("nanogl/texture-2d").default | undefined;
    sh?: ArrayLike<number> | undefined;
    readonly _type = LightType.IBL;
    iblFormat: IblFormat;
    textureFormat: HdrEncoding;
    hdrEncoding: HdrEncoding;
    shFormat: ShFormat;
    enableRotation: boolean;
    enableBoxProjection: boolean;
    readonly boxProjectionSize: vec3;
    readonly boxProjectionOffset: vec3;
    constructor(env?: import("nanogl/texture-cube").default | import("nanogl/texture-2d").default | undefined, sh?: ArrayLike<number> | undefined);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo?: number): Float32Array;
}
