import TextureCube from 'nanogl/texture-cube';
import IblBase from './IblBase';
export default class IblPmrem extends IblBase {
    readonly iblType = "PMREM";
    env: TextureCube;
}
