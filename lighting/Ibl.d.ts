import { vec3 } from 'gl-matrix';
import { Texture } from 'nanogl/texture-base';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';
export type IblBoxProjection = {
    center: vec3;
    min: vec3;
    max: vec3;
};
export default class Ibl extends Light {
    env?: Texture | undefined;
    sh?: ArrayLike<number> | undefined;
    readonly _type = LightType.IBL;
    iblFormat: IblFormat;
    hdrEncoding: HdrEncoding;
    shFormat: ShFormat;
    mipLevels: number;
    enableRotation: boolean;
    enableBoxProjection: boolean;
    intensity: number;
    ambiantIntensity: number;
    specularIntensity: number;
    readonly boxProjectionSize: vec3;
    readonly boxProjectionOffset: vec3;
    constructor(env?: Texture | undefined, sh?: ArrayLike<number> | undefined);
}
