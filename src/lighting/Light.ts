import Node from 'nanogl-node'
import Texture2D from 'nanogl/texture-2d'

import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Camera from 'nanogl-camera'
import Bounds from '../Bounds'
import LightType from './LightType'



/**
 * This class is the base class for all lights.
 */
export default abstract class Light extends Node {
  /** The type of lighting */
  abstract readonly _type: LightType;

  constructor() {
    super();
  }

}

/**
 * Know whether a given light is a shadow mapped light or not.
 * @param light The light to test
 */
export function lightIsShadowMappedLight( light : Light ) : light is ShadowMappedLight {
  return light._type === LightType.DIRECTIONAL || light._type === LightType.SPOT;
}

/**
 * This interface represents a light that supports shadow mapping.
 */
export interface ShadowMappedLight extends Light {
  /** Enable or disable shadow casting */
  castShadows : boolean;
  /** The size of the shadow map created by the light */
  shadowmapSize : number;

  /**
   * Adjust the camera's projection of the light's shadowmap
   * to fit the given bounds.
   * @param {Bounds} bounds The bounds to use
   */
  projectionFromBounds(bounds: Bounds) : void;

  /**
   * Create the FBO resource used as target when rendering the shadowmap.
   * @param {GLContext} gl The webgl context to use
   */
  initShadowmap(gl:GLContext) : void;

  /**
   * Get the light shadowmap texture.
   * It can be an RGB texture or a Depth texture if supported.
   */
  getShadowmap() : Texture2D | null;

  /**
   * Prepare and bind the shadowmap's FBO in order to render shadow casters.
   */
  bindShadowmap() : void;

  /**
   * Know whether the shadowmap is a native Depth texture or not.
   */
  hasDepthShadowmap() : boolean;

  /**
   * Get the texel bias vector used to sample the shadowmap.
   */
  getTexelBiasVector() : Float32Array;

  /**
   * Get the camera suitable to render the shadowmap.
   */
  getCamera():Camera;

  /**
   * Get the projection matrix for the shadowmap.
   * @param bounds The bounds to use for the projection
   */
  getShadowProjection( bounds : Bounds ) : mat4;
}
