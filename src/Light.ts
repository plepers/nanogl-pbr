import Node from 'nanogl-node'
import Texture from 'nanogl/texture'
import Fbo from 'nanogl/fbo'
import RB from 'nanogl/renderbuffer'
import PF from 'nanogl-pf'

import { mat4, vec3 } from 'gl-matrix';
import { GLContext, isWebgl2 } from 'nanogl/types';
import Camera from 'nanogl-camera'
import Bounds from './Bounds'
import LightType from './LightType'
import { ICameraLens } from 'nanogl-camera/ICameraLens';


// for shadow proj
const ScreenMtx : mat4 = <mat4>new Float32Array([
  0.5, 0, 0, 0,
  0, 0.5, 0, 0,
  0, 0, 0.5, 0,
  .5, .5, .5, 1
]);

const LightMtx = mat4.create();
const V6 = new Float32Array(6);
const V3 = vec3.create();


abstract class Light extends Node {

  gl: GLContext;
  _type: LightType;
  _color: Float32Array;
  _wdir: Float32Array;
  _castShadows: boolean;
  _fbo: Fbo|null;
  _camera: Camera|null;

  _shadowmapSize: number;
  iblShadowing: number;



  constructor(gl: GLContext) {
    super();

    this.gl = gl;

    this._type = LightType.UNKNOWN;
    this._color = new Float32Array([1.0, 1.0, 1.0]);
    this._wdir = new Float32Array(this._wmatrix.buffer, 8 * 4, 3);

    this._castShadows = false;
    this._fbo = null;
    this._camera = null;

    this._shadowmapSize = 512;
    this.iblShadowing = .5;
  }




  getShadowProjection( bounds : Bounds ) : mat4 {
    this.projectionFromBounds(bounds);
    this._camera!.updateViewProjectionMatrix(1, 1);
    mat4.multiply(LightMtx, ScreenMtx, this._camera!._viewProj);
    return LightMtx;
  }

  abstract projectionFromBounds(bounds: Bounds) : void;

  abstract _createCamera():Camera;
  abstract getTexelBiasVector() : Float32Array;



  castShadows(flag:boolean) {
    if (this._castShadows !== flag) {
      this._castShadows = flag;
      (flag) ? this._initShadowMapping() : this._releaseShadowMapping();
    }
  }


  /**
   * return true if shadowmap support depth texture
   */
  hasDepthShadowmap() {
    return this._castShadows && this._fbo!.getAttachment(this.gl.DEPTH_ATTACHMENT)!.isTexture();
  }

  /**
   * return fbo color if depth_texture is not supported
   * otherwise return depth texture
   * return null if light don't cast shadows
   */
  getShadowmap() {
    if (this._castShadows) {
      var att = this._fbo!.getAttachment(this.gl.DEPTH_ATTACHMENT);
      if( att !== null )
        return att.isTexture() ? att.target : this._fbo!.getAttachment(this.gl.COLOR_ATTACHMENT0)!.target;
    }
    return null;
  }



  _initShadowMapping() {
    // assert this._castShadows == true
    var s = this._shadowmapSize;
    var gl = this.gl;


    // color attachment
    // ----------------
    this._fbo = new Fbo(gl);
    this._fbo.bind();
    this._fbo.resize(s, s);
    this._fbo.attach(gl.COLOR_ATTACHMENT0, new Texture(gl, gl.RGB));


    // depth attachment
    // ----------------
    // use depth texture if possible
    var hasDTex = PF.getInstance(gl).hasDepthTexture();
    this._fbo.attachDepth(true, false, hasDTex);



    var smap = this.getShadowmap() as Texture;
    smap.bind()

    var gl = this.gl;
    if (isWebgl2(gl)) {
      // TODO filtering option for GLSL 300
      smap.setFilter(true, false, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    } else {
      smap.setFilter(false, false, false);
    }


    this._camera = this._createCamera();
    this.add(this._camera);
  }


  _releaseShadowMapping() {
    this._fbo!.dispose()
    this._fbo = null;
    this.remove(this._camera!);
    this._camera = null;
  }




  prepareShadowmap() {
    const  s = this._shadowmapSize;
    const fbo = this._fbo!;
    fbo.resize(s, s);
    fbo.bind();
    fbo.defaultViewport();
  }


  boundsInLocalSpace( bounds : Bounds ) {
    V6[0] = V6[1] = V6[2] = Number.MAX_VALUE;
    V6[3] = V6[4] = V6[5] = -Number.MAX_VALUE;

    for (var bCorner = 0; 8 > bCorner; bCorner++) {
      V3[0] = (bCorner & 1) ? bounds.max[0] : bounds.min[0];
      V3[1] = (bCorner & 2) ? bounds.max[1] : bounds.min[1];
      V3[2] = (bCorner & 4) ? bounds.max[2] : bounds.min[2];

      vec3.transformMat4(V3, V3, this._camera!._view);

      V6[0] = Math.min(V6[0], V3[0]);
      V6[1] = Math.min(V6[1], V3[1]);
      V6[2] = Math.min(V6[2], V3[2]);
      V6[3] = Math.max(V6[3], V3[0]);
      V6[4] = Math.max(V6[4], V3[1]);
      V6[5] = Math.max(V6[5], V3[2]);
    }
    return V6;
  }
}






export default Light
