import Program from 'nanogl/program';
import Texture2D from 'nanogl/texture-2d';
import Light from './Light';
import LightType from './LightType';
export default class IBL extends Light {
    readonly _type = LightType.IBL;
    env: Texture2D;
    sh: ArrayLike<number>;
    constructor(env: Texture2D, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo?: number): Float32Array;
}
