import Node       from 'nanogl-node'
import Camera       from 'nanogl-camera'

import { GLContext } from 'nanogl/types';
import Enum         from'./Enum'

import { mat4 } from 'gl-matrix';

import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import Program from 'nanogl/program'
import LightSetup from './lighting/LightSetup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import DepthFormat, { DepthFormatEnum } from './DepthFormatEnum';
import ShaderPrecision from './ShaderPrecision';
import MaterialPass from './MaterialPass';

const M4           = mat4.create();


/**
 * This class manages the depth pass of a material.
 * @extends {MaterialPass}
 */
export default class DepthPass extends MaterialPass {
  /** The depth pass format */
  depthFormat: DepthFormatEnum;
  /** The shader float precision */
  precision: ShaderPrecision;

  /**
   * @param {GLContext} gl The webgl context this DepthPass belongs to
   */
  constructor( gl : GLContext ){

    super( {
      uid  : 'stddepth',
      vert : VertShader(),
      frag : FragShader(),
    } );

    this.depthFormat  = this.inputs.add( new Enum( 'depthFormat', DepthFormat ) );
    this.precision    = this.inputs.add( new ShaderPrecision( 'highp' ) );


  }

  /**
   * Set the light setup to use for this pass.
   * @param {LightSetup} setup The light setup to use for this pass
   */
  setLightSetup( setup : LightSetup ){
    this.depthFormat.proxy( setup?.depthFormat );
  }

  prepare( prg : Program, node :Node, camera : Camera<ICameraLens> ){

    if( prg.uMVP ){
      camera.modelViewProjectionMatrix( M4, node._wmatrix );
      prg.uMVP(          M4            );
    }

    if( prg.uWorldMatrix )
      prg.uWorldMatrix( node._wmatrix );

    if( prg.uVP )
      prg.uVP( camera._viewProj );

  }


}
