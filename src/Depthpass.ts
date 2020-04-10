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



export default class DepthPass extends MaterialPass {
  
  depthFormat: DepthFormatEnum;
  precision: ShaderPrecision;

  
  constructor( gl : GLContext ){
    
    super( {
      uid  : 'stddepth',
      vert : VertShader(),
      frag : FragShader(),
    } );

    this.depthFormat  = this.inputs.add( new Enum( 'depthFormat', DepthFormat ) );
    this.precision    = this.inputs.add( new ShaderPrecision( 'highp' ) );  

  }
  
  setLightSetup( setup : LightSetup ){
    this.depthFormat.proxy( setup?.depthFormat );
  }
  
  // render time !
  // ----------
  prepare( prg : Program, node :Node, camera : Camera<ICameraLens> ){
    
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP( M4 );

  }


}

