
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
import { ColorSpace, ColorSpaceEnum } from './ColorSpace'


const M4 = mat4.create();

const MAT_ID = 'std';

/**
 * This class manages the standard pass of a material.
 * @extends {MaterialPass}
 * @typeParam TSurface The type of the PBR surface to use for this pass
 */
export class StandardPass<TSurface extends PbrSurface = PbrSurface> extends MaterialPass {

  /** The glsl version */
  version              : ShaderVersion
  /** The shader float precision */
  precision            : ShaderPrecision
  /** The id for the shader */
  shaderid             : Flag
  /** The alpha value */
  alpha                : Input
  /** The alpha factor */
  alphaFactor          : Input
  /** The alpha cutoff */
  alphaCutoff          : Input
  /** The emissive color */
  emissive             : Input
  /** The emissive factor */
  emissiveFactor       : Input
  /** The normal map */
  normal               : Input
  /** The normal scale */
  normalScale          : Input
  /** The occlusion value */
  occlusion            : Input
  /** The occlusion strength */
  occlusionStrength    : Input
  /**
   * The gamma value for gamma correction
   * (only used if gammaMode is set to `GAMMA_STD`)
   */
  iGamma               : Input
  /** The exposure multiplier */
  iExposure            : Input

  /** The alpha rendering mode */
  alphaMode: AlphaModeEnum
  /** The gamma correction mode */
  gammaMode: GammaModeEnum

  /** Whether the backface of the geometry should be rendered or not */
  doubleSided   : Flag
  /** @hidden */
  horizonFading : Flag
  /**
   * Whether glossiness should use the nearest env map blur level or a lerp between
   * the higher and lower levels
   */
  glossNearest  : Flag
  /** Whether the irradiance should be computed per vertex or per fragment */
  perVertexIrrad: Flag
  /** The PBR surface used for this pass */
  surface?: TSurface

  // private _uvs : Map<number, UVTransform> = new Map()

  /**
   * @typeParam TSurface The type of the PBR surface to use for this pass
   * @param name The name of the pass
   */
  constructor( name : string = 'gltf-std-pass' ){

    super( {
      uid  : MAT_ID,
      vert : vShader(),
      frag : fShader(),
    } );



    const inputs = this.inputs;


    inputs.add( this.version               = new ShaderVersion( ) );
    inputs.add( this.precision             = new ShaderPrecision( 'highp' ) );
    inputs.add( this.shaderid              = new Flag ( 'id_'+MAT_ID,  true  ) );


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

  }

  /**
   * Set the PBR surface to use for this pass.
   * @param surface The surface to use for this pass
   */
  setSurface( surface:TSurface ) : void {
    if( this.surface ) {
      this.inputs.remove( this.surface );
    }
    this.surface = surface;
    this.inputs.add( this.surface );
  }

  /**
   * Set the light setup to use for this pass.
   * @param {LightSetup} setup The light setup to use for this pass
   */
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

/**
 * This class manages the standard pass of a specular material.
 * @extends {StandardPass<SpecularSurface>}
 */
export class StandardSpecular extends StandardPass<SpecularSurface> {

  readonly surface!: SpecularSurface

  /**
   * @param name The name of the pass
   */
  constructor( name : string = 'gltf-std-pass' ){
    super( name );
    var surface = new SpecularSurface()
    this.setSurface( surface );
  }


}

/**
 * This class manages the standard pass of a metalness material.
 * @extends {StandardPass<SpecularSurface>}
 */
export class StandardMetalness extends StandardPass<MetalnessSurface> {

  readonly surface!: MetalnessSurface;

  /**
   * @param name The name of the pass
   */
  constructor( name : string = 'gltf-std-pass' ){
    super( name );
    var surface = new MetalnessSurface()
    this.setSurface( surface );
  }

}
