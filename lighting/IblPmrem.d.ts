import Program from 'nanogl/program';
import TextureCube from 'nanogl/texture-cube';
import IblBase from './IblBase';
import LightType from './LightType';
export default class IblPmrem extends IblBase {
    readonly _type = LightType.IBL_PMREM;
    env: TextureCube;
    constructor(env: TextureCube, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
}
