
import Program from 'nanogl/program';
import TextureCube from 'nanogl/texture-cube';
import { ShMode } from '../interfaces/ShMode';
import Light from './Light';
import LightType from './LightType';

export default class IBLPmrem extends Light {

  readonly _type = LightType.IBL_PMREM;

  env: TextureCube;
  sh: ArrayLike<number>;
  shMode: ShMode = "SH9";
  specularExpo: Number = 1.0;
  diffuseExpo: Number = 1.0;

  constructor( env : TextureCube, sh : ArrayLike<number> ){
    super();
    this.env   = env;
    this.sh    = sh;

    // this
  }

  setupProgram( prg : Program ){
    if( prg.tEnv )      prg.tEnv(       this.env );
    if( prg.uSHCoeffs ) prg.uSHCoeffs(  this.sh  );
  }

}

