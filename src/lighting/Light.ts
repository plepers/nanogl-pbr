import Node from 'nanogl-node'
import Texture2D from 'nanogl/texture-2d'
import Fbo from 'nanogl/fbo'
import RB from 'nanogl/renderbuffer'
import PF from 'nanogl-pf'

import { mat4, vec3 } from 'gl-matrix';
import { GLContext, isWebgl2 } from 'nanogl/types';
import Camera from 'nanogl-camera'
import Bounds from '../Bounds'
import LightType from './LightType'
import { ICameraLens } from 'nanogl-camera/ICameraLens';




abstract class Light extends Node {

  abstract readonly _type: LightType;


  constructor() {
    super();
  }


  // abstract projectionFromBounds(bounds: Bounds) : void;
  // abstract getShadowmap( gl : GLContext ) : Texture2D | null;
  // abstract prepareShadowmap() : void;
  // abstract hasDepthShadowmap() : boolean;
  // abstract getTexelBiasVector() : Float32Array;
  // abstract _createCamera():Camera;
  // abstract getShadowProjection( bounds : Bounds ) : mat4;
  // abstract getShadowmapSize() : number;

}



export interface ShadowMappedLight {
  projectionFromBounds(bounds: Bounds) : void;
  getShadowmap( gl : GLContext ) : Texture2D | null;
  prepareShadowmap() : void;
  hasDepthShadowmap() : boolean;
  getTexelBiasVector() : Float32Array;
  _createCamera():Camera;
  getShadowProjection( bounds : Bounds ) : mat4;
  getShadowmapSize() : number;
}





export default Light
