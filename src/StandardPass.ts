
import { mat4 } from 'gl-matrix'

import vShader            from './glsl/standard.vert'
import fShader            from './glsl/standard.frag'

import  Input          from './Input'
import  Flag           from './Flag'
import  Enum           from './Enum'
import {GammaModeEnum, GammaModes} from './GammaModeEnum'
import  MaterialPass   from './MaterialPass'
import  Program        from 'nanogl/program'
import  Node           from 'nanogl-node'
import  Camera         from 'nanogl-camera'
import  IBL            from './Ibl'
import  LightSetup     from './LightSetup'
import PbrInputs from './PbrInputs'
import PbrSurface from './PbrInputs'
import { AlphaModeEnum, AlphaModes } from './AlphaModeEnum'
import ShaderVersion from './ShaderVersion'
import ShaderPrecision from './ShaderPrecision'


const M4 = mat4.create();

const MAT_ID = 'std';

/**
 * @extends {BaseMaterial}
 */
export default class StandardPass extends MaterialPass {


  version              : ShaderVersion
  precision            : ShaderPrecision
  shaderid             : Flag
  alpha                : Input
  alphaFactor          : Input
  alphaCutoff          : Input
  emissive             : Input
  emissiveFactor       : Input
  normal               : Input
  normalScale          : Input
  occlusion            : Input
  occlusionStrength    : Input
  iGamma               : Input
  iExposure            : Input

  alphaMode: AlphaModeEnum
  gammaMode: GammaModeEnum

  doubleSided   : Flag
  perVertexIrrad: Flag
  horizonFading : Flag
  glossNearest  : Flag
  
  surface: PbrInputs

  // private _uvs : Map<number, UVTransform> = new Map()

  constructor( name : string = 'gltf-std-pass' ){

    super( {
      uid  : MAT_ID,
      vert : vShader(),
      frag : fShader(),
    } );



    const inputs = this.inputs;


    inputs.add( this.version               = new ShaderVersion( '100' ) );
    inputs.add( this.precision             = new ShaderPrecision( 'highp' ) );
    inputs.add( this.shaderid              = new Flag ( 'id_'+MAT_ID,  true  ) );

    inputs.add( this.surface               = PbrSurface.SpecularSurface() )

    inputs.add( this.alpha                 = new Input( 'alpha'              , 1 ) );
    inputs.add( this.alphaFactor           = new Input( 'alphaFactor'        , 1 ) );
    inputs.add( this.alphaCutoff           = new Input( 'alphaCutoff'        , 1 ) );

    inputs.add( this.emissive              = new Input( 'emissive'           , 3 ) );
    inputs.add( this.emissiveFactor        = new Input( 'emissiveFactor'     , 3 ) );

    inputs.add( this.normal                = new Input( 'normal'             , 3 ) );
    inputs.add( this.normalScale           = new Input( 'normalScale'        , 1 ) );

    inputs.add( this.occlusion             = new Input( 'occlusion'          , 1 ) );
    inputs.add( this.occlusionStrength     = new Input( 'occlusionStrength'  , 1 ) );
    
    inputs.add( this.iGamma                = new Input( 'gamma'              , 1 ) );
    inputs.add( this.iExposure             = new Input( 'exposure'           , 1 ) );

    inputs.add( this.alphaMode             = new Enum( 'alphaMode', AlphaModes ));
    inputs.add( this.gammaMode             = new Enum( 'gammaMode', GammaModes )).set( 'GAMMA_2_2' );

    inputs.add( this.doubleSided           = new Flag ( 'doubleSided'   ,  false ) );
    inputs.add( this.perVertexIrrad        = new Flag ( 'perVertexIrrad',  false ) );
    inputs.add( this.horizonFading         = new Flag ( 'horizonFading' ,  false ) );
    inputs.add( this.glossNearest          = new Flag ( 'glossNearest'  ,  false ) );
    // inputs.add( this.useDerivatives  = new Flag ( 'useDerivatives',  false ) );


  }



  setLightSetup( setup : LightSetup ){
    this.inputs.addChunks( setup.getChunks( 'std' ) );
  }

  
  prepare( prg:Program, node : Node, camera : Camera ){
    
    // matrices
    
    if( prg.uMVP ){
      camera.modelViewProjectionMatrix( M4, node._wmatrix );
      prg.uMVP(          M4            );
    }
    
    if( prg.uWorldMatrix )
      prg.uWorldMatrix( node._wmatrix );
    
    if( prg.uVP )
      prg.uVP( camera._viewProj );
    
    if( prg.uCameraPosition )
      prg.uCameraPosition( camera._wposition );
  

  }


};




// import Input        from './Input'
// import Flag         from './Flag'
// import Enum         from './Enum'
// import Precision    from './ShaderPrecision'
// import Version      from './ShaderVersion'
// import { mat4 } from 'gl-matrix'


// import getVert from './glsl/pbr.vert'
// import getFrag from './glsl/pbr.frag'
// import { GLContext, isWebgl2 } from 'nanogl/types'
// import IBL from './Ibl'
// import LightSetup from './LightSetup'
// import Node from 'nanogl-node'
// import Camera from 'nanogl-camera'
// import { ICameraLens } from 'nanogl-camera/ICameraLens'
// import { GammaModes, GammaModeEnum } from './GammaModeEnum'
// import { ShaderSource } from './interfaces/IProgramSource'
// import MaterialPass from './MaterialPass'
// import Program from 'nanogl/program'
// import TexCoord from './TexCoord'


// const M4 = mat4.create();

// const MAT_ID = 'std';


// export default class StandardPass extends MaterialPass {

  
//   ibl: IBL | null
  

//   version  : Version
//   precision: Precision

  
//   albedo        : Input
//   specular      : Input
//   gloss         : Input
//   normal        : Input
//   occlusion     : Input
//   cavity        : Input
//   cavityStrength: Input
//   emissive      : Input
//   emissiveScale : Input
//   fresnel       : Input
//   gamma         : Input
//   exposure      : Input
  
//   conserveEnergy : Flag
//   perVertexIrrad : Flag
//   glossNearest   : Flag
//   useDerivatives : Flag
  
//   gammaMode: GammaModeEnum
  
  
//   constructor( name : string = 'standard-pass' ){

//     super( {
//       uid  : MAT_ID,
//       vert : getVert(),
//       frag : getFrag(),
//     } );
    
//     this.name = name;

//     this.ibl = null;

//     const i = this.inputs;

//     this.version         = i.add( new Version( '100' ) );
//     this.precision       = i.add( new Precision( 'mediump' ) );

//     this.albedo          = i.add( new Input( 'albedo',          3 ) );
//     this.specular        = i.add( new Input( 'specular',        3 ) );
//     this.gloss           = i.add( new Input( 'gloss',           1 ) );

//     this.normal          = i.add( new Input( 'normal',          3 ) );
//     this.occlusion       = i.add( new Input( 'occlusion',       1 ) );
//     this.cavity          = i.add( new Input( 'cavity',          1 ) );
//     this.cavityStrength  = i.add( new Input( 'cavityStrength',  2 ) );
//     this.emissive        = i.add( new Input( 'emissive',        1 ) );
//     this.emissiveScale   = i.add( new Input( 'emissiveScale',   1 ) );
//     this.fresnel         = i.add( new Input( 'fresnel',         3 ) );
//     this.gamma           = i.add( new Input( 'gamma',           1 ) );
//     this.exposure        = i.add( new Input( 'exposure',        1 ) );

//     this.conserveEnergy  = i.add( new Flag ( 'conserveEnergy',  true  ) );
//     this.perVertexIrrad  = i.add( new Flag ( 'perVertexIrrad',  false ) );
//     this.glossNearest    = i.add( new Flag ( 'glossNearest',    false ) );
//     this.useDerivatives  = i.add( new Flag ( 'useDerivatives',  false ) );

//     this.gammaMode       = i.add( new Enum( 'gammaMode', GammaModes ));

//   }

 

//   setIBL( ibl : IBL ){
//     this.ibl = ibl;
//   }


//   setLightSetup( setup : LightSetup ){
//     this.inputs.addChunks( setup.getChunks( 'std' ) );
//   }


//   prepare( prg:Program, node : Node, camera : Camera<ICameraLens> ){

//     // this.


//     this.ibl!.setupProgram( prg );

//     // matrices
//     camera.modelViewProjectionMatrix( M4, node._wmatrix );
//     prg.uMVP(          M4            );
//     prg.uWorldMatrix(  node._wmatrix );

//     //
//     prg.uCameraPosition( camera._wposition );

//   }




// };
