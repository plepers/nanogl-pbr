import Config       from 'nanogl-state/config'
import Node       from 'nanogl-node'
import Camera       from 'nanogl-camera'

import ProgramCache from './ProgramCache'
import { GLContext } from 'nanogl/types';
import Input        from'./Input'
import Flag         from'./Flag'
import Enum         from'./Enum'

import { mat4 } from 'gl-matrix';
import { GlslPrecision } from './interfaces/GlslPrecision';
import IMaterial from './interfaces/IMaterial';

import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import Program from 'nanogl/program'
import LightSetup from './LightSetup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import DepthFormat, { DepthFormatEnum } from './DepthFormatEnum';
import ChunkCollection from './ChunkCollection';
import IProgramSource, { ShaderSource } from './interfaces/IProgramSource';
import BaseMaterial from './BaseMaterial';
import ShaderPrecision from './ShaderPrecision';

const M4           = mat4.create();



export default class DepthPass extends BaseMaterial {
  
  depthFormat: DepthFormatEnum;



  _shaderSource: ShaderSource
  precision: ShaderPrecision;

  getShaderSource(): ShaderSource {
    return this._shaderSource;
  }
  
  constructor( gl : GLContext ){
    
    super( gl, 'stddepth' );

    this.depthFormat  = this.inputs.add( new Enum( 'depthFormat', DepthFormat ) );
    this.precision    = this.inputs.add( new ShaderPrecision( 'highp' ) );
    
    this._shaderSource = {
      uid  : 'stddepth',
      vert : VertShader(),
      frag : FragShader(),
    }

  }
  
  
  
  
  setLightSetup( setup : LightSetup ){
    this.depthFormat.proxy( setup?.depthFormat );
  }
  
  // render time !
  // ----------
  prepare( node :Node, camera : Camera<ICameraLens> ){
    
    var prg = this.getProgram();
    prg.use();

    prg.setupInputs( this );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP( M4 );


  }


}

