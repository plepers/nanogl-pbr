
import { vec3 } from 'gl-matrix';
import Program from 'nanogl/program';
import { Texture } from 'nanogl/texture-base';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';


export type IblBoxProjection = {
  center: vec3;
  min: vec3;
  max: vec3;
}

export default class Ibl extends Light {

  readonly _type = LightType.IBL;

  /**
   * The type of Mapping of the env map
   */
  iblFormat : IblFormat = 'OCTA';

  /**
   * Encoding used to storee HDR values in the env map
   */
  hdrEncoding: HdrEncoding = "RGBM";


  shFormat: ShFormat = "SH9";

  /**
   * number of available mip levels in the env map
   * In pmrem, the lower mip levels can be left unused (black) to keep definition in high roughness values
   */
  mipLevels = 5;

  /**
   * enable rotation of the IBL
   */
  enableRotation = false


  
  /**
   * enable box projection for reflection
   */
  enableBoxProjection = false
  
  /**
   * global intensity of the ibl
   */
  intensity = 1.0;

  /**
   * intensity of the SH part
   */
  ambiantIntensity = 1.0;

  /**
   * intensity of environement reflections
   */
  specularIntensity = 1.0;

  /**
   * The size of the box projection
   */
  readonly boxProjectionSize = vec3.fromValues(1, 1, 1)
  
  /**
   * offset the center of the projection relative to the world space position of the light's node
   */
  readonly boxProjectionOffset = vec3.fromValues(0, 0, 0)

  


  constructor( public env? : Texture, public sh? : ArrayLike<number> ){
    super();
  }


}

