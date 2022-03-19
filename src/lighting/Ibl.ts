
import Program from 'nanogl/program';
import Texture2D from 'nanogl/texture-2d';
import IblBase from './IblBase';
import LightType from './LightType';


export default class Ibl extends IblBase {
  
  readonly _type = LightType.IBL;
  
  env: Texture2D;
  
  constructor( env : Texture2D, sh : ArrayLike<number> ){
    super( sh );
    this.env   = env;
  }

  setupProgram( prg : Program ){
    super.setupProgram(prg)
    if( prg.tEnv )      prg.tEnv(       this.env );
  }

}

