
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
import  LightSetup     from './lighting/LightSetup'
import { AlphaModeEnum, AlphaModes } from './AlphaModeEnum'
import ShaderVersion from './ShaderVersion'
import ShaderPrecision from './ShaderPrecision'
import { PbrSurface, SpecularSurface, MetalnessSurface } from './PbrSurface'
import { ColorSpace, ColorSpaceEnum } from './ColorspaceEnum'


const M4 = mat4.create();

const MAT_ID = 'std';

/**
 * @extends {BaseMaterial}
 */

export class StandardPass<TSurface extends PbrSurface = PbrSurface> extends MaterialPass {


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
  emissiveColorSpace: ColorSpaceEnum

  doubleSided   : Flag
  horizonFading : Flag
  glossNearest  : Flag
  /**
   * @deprecated
   */
  perVertexIrrad: Flag
  
  surface?: TSurface

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


    inputs.add( this.alpha                 = new Input( 'alpha'              , 1 ) );
    inputs.add( this.alphaFactor           = new Input( 'alphaFactor'        , 1 ) );
    inputs.add( this.alphaCutoff           = new Input( 'alphaCutoff'        , 1 ) );

    inputs.add( this.emissive              = new Input( 'emissive'           , 3 ) );
    inputs.add( this.emissiveColorSpace    = new Enum(  'emissiveColorSpace' , ColorSpace ));
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


  setSurface( surface:TSurface ) : void {
    if( this.surface ) {
      this.inputs.remove( this.surface );
    }
    this.surface = surface;
    this.inputs.add( this.surface );
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


export class StandardSpecular extends StandardPass<SpecularSurface> {

  readonly surface: SpecularSurface;

  constructor( name : string = 'gltf-std-pass' ){
    super( name );
    var surface = new SpecularSurface()
    this.setSurface( surface );
    this.surface = surface;
  }


}

export class StandardMetalness extends StandardPass<MetalnessSurface> {
  
  readonly surface: MetalnessSurface;

  constructor( name : string = 'gltf-std-pass' ){
    super( name );
    var surface = new MetalnessSurface()
    this.setSurface( surface );
    this.surface = surface;
  }

}


