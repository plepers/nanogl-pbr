import Node from 'nanogl-node'
import Texture2D from 'nanogl/texture-2d'

import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Camera from 'nanogl-camera'
import Bounds from '../Bounds'
import LightType from './LightType'




export default abstract class Light extends Node {

  abstract readonly _type: LightType;

  constructor() {
    super();
  }

}


export function lightIsShadowMappedLight( light : Light ) : light is ShadowMappedLight {
  return light._type === LightType.DIRECTIONAL || light._type === LightType.SPOT;
}

export interface ShadowMappedLight extends Light {
  /**
   * Enable or disable shadow casting
   */
  castShadows : boolean;

  /**
   * The side size of the shadow map created by the light
   */
  shadowmapSize : number;

  /**
   * Adjust the camera's projection of the light's shadowmap
   * to fit the given bounds
   * @param bounds 
   */
  projectionFromBounds(bounds: Bounds) : void;

  /**
   * Create FBO resource used as target when rendering the shadowmap
   * @param gl 
   */
  initShadowmap(gl:GLContext) : void;

  /**
   * retrun the shadowmap texture. Cn be a RGB texture or a Depthtexture if supported
   */
  getShadowmap() : Texture2D | null;

  /**
   * prepare and bind the shadowmap's FBO in order to render shadow casters
   */
  bindShadowmap() : void;

  /**
   * return true if the shadowmap is a native Depth texture
   */
  hasDepthShadowmap() : boolean;
  
  getTexelBiasVector() : Float32Array;

  /**
   * return the camera suitable to render the shadowmap
   */
  getCamera():Camera;
  getShadowProjection( bounds : Bounds ) : mat4;
}




