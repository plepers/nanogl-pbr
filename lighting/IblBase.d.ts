import { vec3 } from 'gl-matrix';
import Program from 'nanogl/program';
import { Texture } from 'nanogl/texture-base';
import { ShMode } from '../interfaces/ShMode';
import { IblType } from './IblModel';
import Light from './Light';
import LightType from './LightType';
export declare type IblBoxProjection = {
    center: vec3;
    min: vec3;
    max: vec3;
};
export default abstract class IblBase extends Light {
    env: Texture;
    sh: ArrayLike<number>;
    readonly _type = LightType.IBL;
    abstract readonly iblType: IblType;
    shMode: ShMode;
    enableRotation: boolean;
    enableBoxProjection: boolean;
    readonly boxProjectionSize: vec3;
    readonly boxProjectionOffset: vec3;
    constructor(env: Texture, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo?: number): Float32Array;
}
