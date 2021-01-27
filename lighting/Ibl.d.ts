import Program from 'nanogl/program';
import Texture2D from 'nanogl/texture-2d';
import { ShMode } from '../interfaces/ShMode';
import Light from './Light';
import LightType from './LightType';
export default class IBL extends Light {
    readonly _type = LightType.IBL;
    env: Texture2D;
    sh: ArrayLike<number>;
    shMode: ShMode;
    constructor(env: Texture2D, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo?: number): Float32Array;
}
