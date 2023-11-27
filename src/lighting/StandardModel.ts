
import Program from 'nanogl/program'

import Light, { ShadowMappedLight }            from './Light'
import Enum             from '../Enum'
import Flag             from '../Flag'
import LightSetup       from './LightSetup'
import ILightModel, { ILightModelCode }      from '../interfaces/ILightModel'
import ChunksSlots       from '../ChunksSlots'
import Chunk from '../Chunk'
import { ShadowFilteringEnum, ShadowFiltering } from '../ShadowFilteringEnum'

import _dirPreCode from '../glsl/templates/standard/directional-lights-pre.frag'
import _spotPreCode from '../glsl/templates/standard/spot-lights-pre.frag'
import _pointPreCode from '../glsl/templates/standard/point-lights-pre.frag'

import _dirLightCode from '../glsl/templates/standard/directional-light.frag'
import _spotLightCode from '../glsl/templates/standard/spot-light.frag'
import _pointLightCode from '../glsl/templates/standard/point-light.frag'

import _shadPreCode from '../glsl/templates/standard/shadow-maps-pre.frag'
import _preLightCode from '../glsl/templates/standard/pre-light-setup.frag'
import _postLightCode from '../glsl/templates/standard/post-light-setup.frag'

import _iblPreCode from '../glsl/templates/standard/ibl-pre.frag'
import _iblCode from '../glsl/templates/standard/ibl.frag'

import AbstractLightModel from './AbstractLightModel'
import DirectionalLightModel from './DirectionalLightModel'
import SpotLightModel from './SpotLightModel'
import PointLightModel from './PointLightModel'
import { IblModel } from './IblModel'
import { GlslCode } from '../interfaces/GlslCode'
import { GLContext } from 'nanogl/types'



class StandardModelCode implements ILightModelCode {
  dirPreCode      = _dirPreCode
  spotPreCode     = _spotPreCode
  pointPreCode    = _pointPreCode
  dirLightCode    = _dirLightCode
  spotLightCode   = _spotLightCode
  pointLightCode  = _pointLightCode
  shadPreCode     = _shadPreCode
  preLightCode    = _preLightCode
  postLightCode   = _postLightCode
  iblPreCode      = _iblPreCode
  iblCode         = _iblCode
}


// =================================
//          Light Model
// =================================
/**
 * This class manages standard light models.
 *
 * It is a global light model that handles
 * the light models for all lighting types.
 */
class StandardModel implements ILightModel {
  /** The code for this light model */
  modelCode: ILightModelCode

  /** The shader chunk for the setup before lighting */
  preLightsChunk : PreLightsChunk     ;
  /** The shader chunk for the setup after lighting */
  postLightsChunk: PostLightsChunk    ;
  /** The shader chunk for shadows */
  shadowChunk    : ShadowsChunk       ;
  /** The shader chunk for shadow filtering */
  shadowFilter   : ShadowFilteringEnum

  /** @hidden */
  iblShadowing: Flag;

  // iblChunk : IblChunk;

  /** The list of model type / light model pairs */
  private _datas: Record<string, AbstractLightModel>;
  /** The list of light models */
  private _dataList: AbstractLightModel[];
  /** The light setup for this model */
  private _setup: LightSetup | null;

  /**
   * @param {ILightModelCode} [modelCode] The code for this light model, if not provided, the standard code is used
   */
  constructor( modelCode? : ILightModelCode ) {

    if( modelCode === undefined ){
      modelCode = new StandardModelCode()
    }

    this.modelCode = modelCode;

    this._datas = {}
    this._dataList = []
    this._setup = null;


    this.preLightsChunk  = new PreLightsChunk(this.modelCode.preLightCode);
    this.postLightsChunk = new PostLightsChunk(this.modelCode.postLightCode);
    this.shadowChunk     = new ShadowsChunk(this);

    this.shadowFilter = new Enum('shadowFilter', ShadowFiltering );

    // damp renv reflexion for shadowed pixel
    this.iblShadowing = new Flag('iblShadowing', false);

    this.registerLightModel( new PointLightModel      ( modelCode.pointLightCode , modelCode.pointPreCode      ) );
    this.registerLightModel( new SpotLightModel       ( modelCode.spotLightCode  , modelCode.spotPreCode       ) );
    this.registerLightModel( new DirectionalLightModel( modelCode.dirLightCode   , modelCode.dirPreCode        ) );
    this.registerLightModel( new IblModel             ( modelCode.iblCode        , modelCode.iblPreCode        ) );

  }

  /**
   * Register a light model to this model.
   * @param model The light model to register
   */
  registerLightModel( model : AbstractLightModel ) : void {
    this._datas[model.type] = model;
    this._dataList.push(model);
  }


  getLightSetup(): LightSetup {
    if( this._setup === null ){
      throw new Error('LightSetup is null');
    }
    return this._setup;
  }

  setLightSetup(ls: LightSetup): void {
    this._setup = ls;
  }

  /**
   * Add a light to the model.
   * The light will be added to the corresponding type light model.
   * @param {Light} l The light to add
   */
  add(l: Light) {
    var data = this._datas[l._type];
    data.addLight(l);
  }


  remove(l: Light) {
    var data = this._datas[l._type];
    data.removeLight(l);
  }


  prepare( gl:GLContext ) {
    this.shadowChunk.shadowCount = 0;

    for (var i = 0; i < this._dataList.length; i++) {
      this._dataList[i].prepare(gl,this);
    }

    this.shadowChunk.check();

  }

  getChunks() {
    const res: Chunk[] = [
      this.iblShadowing,
      this.shadowFilter,
      this.shadowChunk,
      this.preLightsChunk,
    ];


    for (var i = 0; i < this._dataList.length; i++) {
      res.push( this._dataList[i] );
    }

    res.push(this.postLightsChunk);

    return res;
  }

}



// =================================
//          COMMON CHUNK
// =================================
/**
 * This class handles the setup before lighting
 * for light models, in a shader chunk.
 */
export class PreLightsChunk extends Chunk {
  /** The shader code for this chunk */
  code: GlslCode

  /**
   * @param {GlslCode} code The shader code for this chunk
   */
  constructor( code : GlslCode) {
    super(true, false);
    this.code = code;
  }

  /**
   * Generate the shader code for this chunk.
   * @param slots The slots to add the code to
   */
  _genCode(slots: ChunksSlots) {
    slots.add('lightsf', this.code(this) );
  }
}

// =================================
//          POST LIGHT CHUNK
// =================================

/**
 * This class handles the setup after lighting
 * for light models, in a shader chunk.
 */
export class PostLightsChunk extends Chunk {
  /** The shader code for this chunk */
  code: GlslCode

  /**
   * @param {GlslCode} code The shader code for this chunk
   */
  constructor( code : GlslCode) {
    super(true, false);
    this.code = code;
  }

  /**
   * Generate the shader code for this chunk.
   * @param slots The slots to add the code to
   */
  _genCode(slots: ChunksSlots) {
    slots.add('lightsf',this.code(this) );
  }

}



// =================================
//          SHADOWS CHUNK
// =================================

const MAX_SHADOWS = 4;
const AA = Math.PI / 4.0;

/**
 * This class handles shadows for light models,
 * in a shader chunk.
 */
export class ShadowsChunk extends Chunk {
  /** The standard model this shadows chunk belongs to */
  lightModel: StandardModel

  /** The number of shadow maps to generate */
  shadowCount: number
  /** The number of generated shadow maps */
  genCount: number

  /** The projection matrix for each shadow */
  _matrices: Float32Array
  /** The texel bias vector for each shadow */
  _texelBiasVector: Float32Array
  /** The size for each shadow map */
  _shadowmapSizes: Float32Array

  /** The buffer used for the uniform for the projection matrices */
  _umatrices: Float32Array | null
  /** The buffer used for the uniform for the texel bias vector */
  _utexelBiasVector: Float32Array | null
  /** The buffer used for the uniform for the shadow map sizes */
  _ushadowmapSizes: Float32Array | null


  /**
   * @param {StandardModel} lightModel The standard model this shadows chunk belongs to
   */
  constructor(lightModel: StandardModel) {
    super(true, true);

    this.lightModel = lightModel;

    this.shadowCount = 0;
    this.genCount = 0;

    this._matrices = new Float32Array(MAX_SHADOWS * 16);
    this._texelBiasVector = new Float32Array(MAX_SHADOWS * 4);
    this._shadowmapSizes = new Float32Array(MAX_SHADOWS * 2);

    this._umatrices = null;
    this._utexelBiasVector = null;
    this._ushadowmapSizes = null;
  }


  /**
   * Generate the shader code for this shadows chunk.
   * @param slots The slots to add the code to
   */
  _genCode(slots: ChunksSlots) {

    if (this.shadowCount > 0) {
      slots.add('pf', this.lightModel.modelCode.shadPreCode(this));
    }

  }

  /**
   * Add a light for which to handle shadow mapping.
   * @param {ShadowMappedLight} light The light to add
   */
  addLight(light: ShadowMappedLight) {

    const i = this.shadowCount;
    const lightSetup = this.lightModel.getLightSetup();

    this.shadowCount++;

    this._matrices.set(light.getShadowProjection(lightSetup.bounds), i * 16);
    this._texelBiasVector.set(light.getTexelBiasVector(), i * 4);

    const s = light.shadowmapSize
    this._shadowmapSizes[i * 2 + 0] = s;
    this._shadowmapSizes[i * 2 + 1] = 1.0 / s;

    if (i === 0) {
      var hasDepthTex = light.hasDepthShadowmap();
      lightSetup.depthFormat.set(hasDepthTex ? 'D_DEPTH' : 'D_RGB');
    }

    return i;
  }

  /**
   * Check if the shadow count and generated shadow count are different.
   * If so, update the shadow data & invalidate the code.
   */
  check() {
    if (this.genCount !== this.shadowCount) {
      this.genCount = this.shadowCount;
      this._umatrices         = new Float32Array(this._matrices.buffer, 0, this.shadowCount * 16)
      this._utexelBiasVector  = new Float32Array(this._texelBiasVector.buffer, 0, this.shadowCount * 4)
      this._ushadowmapSizes   = new Float32Array(this._shadowmapSizes.buffer, 0, this.shadowCount * 2)
      this.invalidateCode();
    }
    this._invalid = true;
  }

  /**
   * Setup the given program for this shadows chunk.
   * @param {Program} prg The program to setup
   */
  setup(prg: Program) {

    if (this.shadowCount > 0) {
      // AA+= .01
      prg.uShadowMatrices(this._umatrices);
      prg.uShadowTexelBiasVector(this._utexelBiasVector);
      prg.uShadowMapSize(this._ushadowmapSizes);
      // not used in NO_FILTER
      if (prg.uShadowKernelRotation !== undefined) {
        prg.uShadowKernelRotation(1.0 * Math.cos(AA), 1.0 * Math.sin(AA));
      }
      this._invalid = false;
    }
  }
}



export default StandardModel