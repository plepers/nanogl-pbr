import Config       from 'nanogl-state/config'
import Node       from 'nanogl-node'
import Camera       from 'nanogl-camera'

import ProgramCache from './program-cache'
import { GLContext } from 'nanogl/types';
import Input        from'./input'
import Flag         from'./flag'
import Enum         from'./enum'
import ChunksList   from'./chunks-tree'

import { mat4 } from 'gl-matrix';
import { GlslPrecision } from './interfaces/precision';
import IMaterial from './interfaces/material';

import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import Program from 'nanogl/program'
import LightSetup from './light-setup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import DepthFormat, { DepthFormatEnum } from './depth-format-enum';

const M4           = mat4.create();



class DepthPass implements IMaterial {
  
  _vertSrc: string;
  _fragSrc: string;
  inputs: ChunksList;


  depthFormat: DepthFormatEnum;

  config: Config;
  _prgcache: ProgramCache;
  _uid: string;
  _precision: GlslPrecision;
  prg: Program | null;

  constructor( gl : GLContext ){
    
    this.prg = null;


    this.inputs          = new ChunksList();


    this.depthFormat = new Enum( 'depthFormat', DepthFormat );

    this.inputs.add( this.depthFormat );
    

    this.config    = new Config();

    this._prgcache = ProgramCache.getCache( gl );

    // for program-cache
    this._uid       = 'stddepth';
    this._precision = 'highp';
    this._vertSrc   = VertShader();
    this._fragSrc   = FragShader();


  }




  setLightSetup( setup : LightSetup ){
    this.depthFormat.proxy( setup?.depthFormat );
  }

  // render time !
  // ----------
  prepare( node :Node, camera : Camera<ICameraLens> ){

    if( this.prg === null ) return;
    
    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg;
    prg.use();

    prg.setupInputs( this );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP( M4 );


  }





  // need recompilation
  _isDirty(){
    return ( this.prg === null || this.inputs._isDirty );
  }


  compile(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



}

export default DepthPass