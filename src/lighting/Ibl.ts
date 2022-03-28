
import Texture2D from 'nanogl/texture-2d';
import IblBase from './IblBase';


export default class Ibl extends IblBase {
  readonly iblType = 'OCTA'
  env!: Texture2D;
}

