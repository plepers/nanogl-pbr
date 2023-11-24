


import { mat4 } from 'gl-matrix'

import vShader            from './glsl/unlit.vert'
import fShader            from './glsl/unlit.frag'

import  Program        from 'nanogl/program'
import  Node           from 'nanogl-node'
import  Camera         from 'nanogl-camera'
import MaterialPass from './MaterialPass'
import Flag from './Flag'
import Input, { ShaderType } from './Input'
import { AlphaModeEnum, AlphaModes } from './AlphaModeEnum'
import Enum from './Enum'
import ShaderVersion from './ShaderVersion'
import ShaderPrecision from './ShaderPrecision'
import LightSetup from './lighting/LightSetup'
import { ColorSpace } from './ColorSpace'


const M4 = mat4.create();

const MAT_ID = 'unlit';

/**
 * This class manages the unlit pass of a material.
 * @extends {MaterialPass}
 */
export default class UnlitPass extends MaterialPass {

  /** The glsl version */
  version              : ShaderVersion
  /** The shader float precision */
  precision            : ShaderPrecision
  /** The id for the shader */
  shaderid             : Flag
  /** The base color */
  baseColor            : Input
  /** The base color factor */
  baseColorFactor      : Input
  /** The alpha value */
  alpha                : Input
  /** The alpha factor */
  alphaFactor          : Input
  /** The alpha cutoff */
  alphaCutoff          : Input

  /** The alpha rendering mode */
  alphaMode: AlphaModeEnum

  /** Whether the backface of the geometry should be rendered or not */
  doubleSided   : Flag

  // private _uvs : Map<number, UVTransform> = new Map()

  /**
   * @param name The name of the pass
   */
  constructor( name : string = 'unlit-pass' ){

    super( {
      uid  : MAT_ID,
      vert : vShader(),
      frag : fShader(),
    } );



    const inputs = this.inputs;


    inputs.add( this.version               = new ShaderVersion( '100' ) );
    inputs.add( this.precision             = new ShaderPrecision( 'highp' ) );
    inputs.add( this.shaderid              = new Flag ( 'id_'+MAT_ID,  true  ) );

    inputs.add( this.baseColor             = new Input( 'baseColor'           , 3, ShaderType.FRAGMENT, ColorSpace.SRGB ) );
    inputs.add( this.baseColorFactor       = new Input( 'baseColorFactor'     , 3, ShaderType.FRAGMENT, ColorSpace.SRGB ) );

    inputs.add( this.alpha                 = new Input( 'alpha'              , 1 ) );
    inputs.add( this.alphaFactor           = new Input( 'alphaFactor'        , 1 ) );
    inputs.add( this.alphaCutoff           = new Input( 'alphaCutoff'        , 1 ) );

    inputs.add( this.alphaMode             = new Enum( 'alphaMode', AlphaModes ));

    inputs.add( this.doubleSided           = new Flag ( 'doubleSided'   ,  false ) );


  }

  /**
   * Set the light setup to use for this pass.
   * Does nothing for an unlit pass.
   * @param {LightSetup} setup The light setup to use for this pass
   */
  setLightSetup( setup : LightSetup ){}


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

  }


};
