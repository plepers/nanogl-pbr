
import { vec3 } from 'gl-matrix';
import { Texture } from 'nanogl/texture-base';
import { HdrEncoding, IblFormat, ShFormat } from './IblModel';
import Light from './Light';
import LightType from './LightType';

/** @hidden */
export type IblBoxProjection = {
  center: vec3;
  min: vec3;
  max: vec3;
}

/**
 * This class manages IBL (Image Based Lighting) lights.
 */
export default class Ibl extends Light {

  readonly _type = LightType.IBL;

  /** The type of mapping of the env map */
  iblFormat : IblFormat = 'OCTA';
  /** The encoding mode used to store HDR values in the env map */
  hdrEncoding: HdrEncoding = "RGBM";
  /** The spherical harmonics format */
  shFormat: ShFormat = "SH9";

  /**
   * The number of available mip levels in the env map.
   * In `PMREM`, the lower mip levels can be left unused (black)
   * to keep definition in high roughness values.
   */
  mipLevels = 5;

  /** Whether to enable rotation of the IBL or not */
  enableRotation = false

  /** Whether to enable box projection for reflection or not */
  enableBoxProjection = false

  /** The global intensity of the IBL */
  intensity = 1.0;

  /** The intensity of the spherical harmonics */
  ambiantIntensity = 1.0;

  /** The intensity of environement reflections */
  specularIntensity = 1.0;

  /** The size of the box projection */
  readonly boxProjectionSize = vec3.fromValues(1, 1, 1)

  /**
   * The offset of the center of the box projection
   * relative to the world space position of the light's node
   */
  readonly boxProjectionOffset = vec3.fromValues(0, 0, 0)

  /**
   * @param {Texture} [env] The env map texture
   * @param {ArrayLike<number>} [sh] The spherical harmonics coefficients
   */
  constructor( public env? : Texture, public sh? : ArrayLike<number> ){
    super();
  }


}
