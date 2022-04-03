import Node from 'nanogl-node'
import Texture2D from 'nanogl/texture-2d'

import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Camera from 'nanogl-camera'
import Bounds from '../Bounds'
import LightType from './LightType'




abstract class Light extends Node {

  abstract readonly _type: LightType;

  constructor() {
    super();
  }

}



export interface ShadowMappedLight {
  shadowmapSize : number;
  projectionFromBounds(bounds: Bounds) : void;
  initShadowmap(gl:GLContext) : void;
  getShadowmap() : Texture2D | null;
  bindShadowmap() : void;
  hasDepthShadowmap() : boolean;
  getTexelBiasVector() : Float32Array;
  _createCamera():Camera;
  getShadowProjection( bounds : Bounds ) : mat4;
}





export default Light
