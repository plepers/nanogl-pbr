import Program from 'nanogl/program';
import TextureCube from 'nanogl/texture-cube';
import { ShMode } from '../interfaces/ShMode';
import Light from './Light';
import LightType from './LightType';
export default class IBLPmrem extends Light {
    readonly _type = LightType.IBL_PMREM;
    env: TextureCube;
    sh: ArrayLike<number>;
    shMode: ShMode;
    specularExpo: Number;
    diffuseExpo: Number;
    constructor(env: TextureCube, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
}
