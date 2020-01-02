import GLConfig       from  'nanogl-state/config'

import ProgramCache from './ProgramCache'
import Input        from './Input'
import Flag         from './Flag'
import Enum         from './Enum'
import Precision    from './ShaderPrecision'
import Version      from './ShaderVersion'
import ChunkCollection   from './ChunkCollection'
import { mat4 } from 'gl-matrix'


import getVert from './glsl/pbr.vert'
import getFrag from './glsl/pbr.frag'
import { GLContext, isWebgl2 } from 'nanogl/types'
import IBL from './Ibl'
import LightSetup from './LightSetup'
import Node from 'nanogl-node'
import Camera from 'nanogl-camera'
import { ICameraLens } from 'nanogl-camera/ICameraLens'
import Program from 'nanogl/program'
import { GammaModes, GammaModeEnum } from './GammaModeEnum'
import IProgramSource from './ProgramSource'


const M4 = mat4.create();
const MAT_ID = 'std';


export default class StandardMaterial {

  ibl: IBL | null
  prg: Program | null

  _prgcache: ProgramCache

  _mask: number

  inputs   : ChunkCollection
  version  : Version
  precision: Precision

  iAlbedo        : Input
  iSpecular      : Input
  iGloss         : Input
  iNormal        : Input
  iOcclusion     : Input
  iCavity        : Input
  iCavityStrength: Input
  iEmissive      : Input
  iEmissiveScale : Input
  iFresnel       : Input
  iGamma         : Input
  iExposure      : Input

  conserveEnergy : Flag
  perVertexIrrad : Flag
  glossNearest   : Flag
  useDerivatives : Flag

  gammaMode: GammaModeEnum
  
  config: GLConfig

  _vertSrc: string
  _fragSrc: string


  constructor( gl : GLContext ){

    this.ibl = null;
    this.prg = null;

    this._mask = 1;

    const webgl2 = isWebgl2(gl);

    this.inputs          = new ChunkCollection( MAT_ID );

    this.version         = this.inputs.add( new Version( webgl2? '300 es' : '100' ) );
    this.precision       = this.inputs.add( new Precision( 'mediump' ) );

    this.iAlbedo         = this.inputs.add( new Input( 'albedo',          3 ) );
    this.iSpecular       = this.inputs.add( new Input( 'specular',        3 ) );
    this.iGloss          = this.inputs.add( new Input( 'gloss',           1 ) );
    this.iNormal         = this.inputs.add( new Input( 'normal',          3 ) );
    this.iOcclusion      = this.inputs.add( new Input( 'occlusion',       1 ) );
    this.iCavity         = this.inputs.add( new Input( 'cavity',          1 ) );
    this.iCavityStrength = this.inputs.add( new Input( 'cavityStrength',  2 ) );
    this.iEmissive       = this.inputs.add( new Input( 'emissive',        1 ) );
    this.iEmissiveScale  = this.inputs.add( new Input( 'emissiveScale',   1 ) );
    this.iFresnel        = this.inputs.add( new Input( 'fresnel',         3 ) );
    this.iGamma          = this.inputs.add( new Input( 'gamma',           1 ) );
    this.iExposure       = this.inputs.add( new Input( 'exposure',        1 ) );

    this.conserveEnergy  = this.inputs.add( new Flag ( 'conserveEnergy',  true  ) );
    this.perVertexIrrad  = this.inputs.add( new Flag ( 'perVertexIrrad',  false ) );
    this.glossNearest    = this.inputs.add( new Flag ( 'glossNearest',    false ) );
    this.useDerivatives  = this.inputs.add( new Flag ( 'useDerivatives',  false ) );

    this.gammaMode       = this.inputs.add( new Enum( 'gammaMode', GammaModes ));


    this.config     = new GLConfig();
    this._prgcache  = ProgramCache.getCache( gl );

    this._vertSrc = getVert();
    this._fragSrc = getFrag();

  }



  setIBL( ibl : IBL ){
    this.ibl = ibl;
  }


  setLightSetup( setup : LightSetup ){
    this.inputs.addChunks( setup.getChunks( 'std' ) );
  }


  // render time !
  // ----------
  prepare( node : Node, camera : Camera<ICameraLens> ){

    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg!;
    prg.use();

    prg.setupInputs( this );

    this.ibl!.setupProgram( prg );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP(          M4            );
    prg.uWorldMatrix(  node._wmatrix );

    //
    prg.uCameraPosition( camera._wposition );

  }




  // need recompilation
  _isDirty(){
    if( this.prg === null || this.inputs.isInvalid() ){
      return true;
    }
    return false;
  }

  getProgram() : Program {
    if( this._isDirty() ){
      this.compile();
    }
    return this.prg!;
  }


  compile(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }

    // this.inputs.updateChunks();

    const prgSource : IProgramSource = {
      vertexSource   : this._vertSrc,
      fragmentSource : this._fragSrc,
      slots          : this.inputs.getCode(),
    }

    this.prg = this._prgcache.compile( prgSource );
  }



};