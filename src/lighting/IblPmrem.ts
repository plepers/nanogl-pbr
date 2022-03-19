
import Program from 'nanogl/program';
import TextureCube from 'nanogl/texture-cube';
import IblBase from './IblBase';
import LightType from './LightType';


export default class IblPmrem extends IblBase {
  
  readonly _type = LightType.IBL_PMREM;
  
  env: TextureCube;
  
  constructor( env : TextureCube, sh : ArrayLike<number> ){
    super( sh );
    this.env   = env;
  }

  setupProgram( prg : Program ){
    super.setupProgram(prg)
    if( prg.tEnv )      prg.tEnv(       this.env );
  }

}
