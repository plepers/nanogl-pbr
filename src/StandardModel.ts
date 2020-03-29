
import Program from 'nanogl/program'

import Light            from './Light'
import Enum             from './Enum'
import Flag             from './Flag'
import LightSetup       from './LightSetup'
import ILightModel, { ILightModelCode }      from './interfaces/ILightModel'
import ChunksSlots       from './ChunksSlots'
import LightType        from './LightType'
import SpotLight        from './SpotLight'
import DirectionalLight from './DirectionalLight'
import PointLight       from './PointLight'
import Chunk from './Chunk'
import { ShadowFilteringEnum, ShadowFiltering } from './ShadowFilteringEnum'

import _dirPreCode from './glsl/templates/standard/directional-lights-pre.frag'
import _spotPreCode from './glsl/templates/standard/spot-lights-pre.frag'
import _pointPreCode from './glsl/templates/standard/point-lights-pre.frag'

import _dirLightCode from './glsl/templates/standard/directional-light.frag'
import _spotLightCode from './glsl/templates/standard/spot-light.frag'
import _pointLightCode from './glsl/templates/standard/point-light.frag'

import _shadPreCode from './glsl/templates/standard/shadow-maps-pre.frag'
import _preLightCode from './glsl/templates/standard/pre-light-setup.frag'
import _postLightCode from './glsl/templates/standard/post-light-setup.frag'

import _iblPreCode from './glsl/templates/standard/ibl-pre.frag'
import _iblCode from './glsl/templates/standard/ibl.frag'


import IBL from './Ibl'

type GlslCode = (o:any)=>string


class StandardModelCode implements ILightModelCode {
  dirPreCode     = _dirPreCode
  spotPreCode    = _spotPreCode
  pointPreCode   = _pointPreCode
  dirLightCode   = _dirLightCode
  spotLightCode  = _spotLightCode
  pointLightCode = _pointLightCode
  shadPreCode    = _shadPreCode
  preLightCode   = _preLightCode
  postLightCode  = _postLightCode
  iblPreCode     = _iblPreCode
  iblCode        = _iblCode
}


// =================================
//          Light Model
// =================================

class StandardModel implements ILightModel {
  
  modelCode: ILightModelCode

  preLightsChunk: PreLightsChunk;
  postLightsChunk: PostLightsChunk;
  shadowChunk: ShadowsChunk;
  shadowFilter: ShadowFilteringEnum

  iblShadowing: Flag;

  iblChunk : IblChunk;

  private _datas: Record<string, BaseLightData>;
  private _dataList: BaseLightData[];
  private _setup: LightSetup | null;

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

    this.iblChunk = new IblChunk( this.modelCode.iblCode, this.modelCode.iblPreCode );

    let d: BaseLightData;

    d = new DirDatas( modelCode.dirLightCode, modelCode.dirPreCode )
    this._datas[LightType.DIRECTIONAL] = d;
    this._dataList.push(d);

    d = new SpotDatas(modelCode.spotLightCode, modelCode.spotPreCode)
    this._datas[LightType.SPOT] = d;
    this._dataList.push(d);

    d = new PointDatas(modelCode.pointLightCode, modelCode.pointPreCode)
    this._datas[LightType.POINT] = d;
    this._dataList.push(d);

  }


  setIbl(ibl: IBL | null): void {
    this.iblChunk.setIbl( ibl );
  }


  getLightSetup(): LightSetup {
    // TODO: assert not null
    return <LightSetup>this._setup;
  }

  setLightSetup(ls: LightSetup): void {
    this._setup = ls;
  }


  add(l: Light) {
    var data = this._datas[l._type];
    data.addLight(l);
  }


  remove(l: Light) {
    var data = this._datas[l._type];
    data.removeLight(l);
  }


  update() {
    this.shadowChunk.shadowCount = 0;

    for (var i = 0; i < this._dataList.length; i++) {
      this._dataList[i].update(this);
    }

    this.shadowChunk.check();

  }

  getChunks() {
    const res: Chunk[] = [
      this.iblShadowing,
      this.shadowFilter,
      this.shadowChunk,
      this.preLightsChunk,
      this.iblChunk
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

class PreLightsChunk extends Chunk {

  code: GlslCode

  constructor( code : GlslCode) {
    super(true, false);
    this.code = code;
  }

  _genCode(slots: ChunksSlots) {
    slots.add('lightsf', this.code(this) );
  }
}

// =================================
//          POST LIGHT CHUNK
// =================================


class PostLightsChunk extends Chunk {

  code: GlslCode

  constructor( code : GlslCode) {
    super(true, false);
    this.code = code;
  }

  _genCode(slots: ChunksSlots) {
    slots.add('lightsf',this.code(this) );
  }

}



// =================================
//          SHADOWS CHUNK
// =================================

const MAX_SHADOWS = 4;
const AA = Math.PI / 4.0;

class ShadowsChunk extends Chunk {

  lightModel: StandardModel

  shadowCount: number
  genCount: number

  _matrices: Float32Array
  _texelBiasVector: Float32Array
  _shadowmapSizes: Float32Array

  _umatrices: Float32Array | null
  _utexelBiasVector: Float32Array | null
  _ushadowmapSizes: Float32Array | null
  


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



  _genCode(slots: ChunksSlots) {

    if (this.shadowCount > 0) {
      slots.add('pf', this.lightModel.modelCode.shadPreCode(this));
    }

  }


  addLight(light: Light) {

    const i = this.shadowCount;
    const lightSetup = this.lightModel.getLightSetup();

    this.shadowCount++;

    this._matrices.set(light.getShadowProjection(lightSetup.bounds), i * 16);
    this._texelBiasVector.set(light.getTexelBiasVector(), i * 4);

    const s = light._shadowmapSize;
    this._shadowmapSizes[i * 2 + 0] = s;
    this._shadowmapSizes[i * 2 + 1] = 1.0 / s;

    if (i === 0) {
      var hasDepthTex = light.hasDepthShadowmap();
      lightSetup.depthFormat.set(hasDepthTex ? 'D_DEPTH' : 'D_RGB');
    }

    return i;
  }


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



class IblChunk extends Chunk {

  preCode : GlslCode
  code    : GlslCode

  ibl : IBL |null = null;

  constructor( code : GlslCode, preCode : GlslCode ) {
    super(true, true);
    this.preCode = preCode;
    this.code    = code;
  }


  setIbl(ibl: IBL | null): void {
    this.ibl = ibl;
    this.invalidateCode();
  }

  setup( prg : Program ){
    if( this.ibl !== null ){
      if( prg.tEnv )      prg.tEnv(       this.ibl.env );
      if( prg.uSHCoeffs ) prg.uSHCoeffs(  this.ibl.sh  );
    }
  }

  _genCode(slots: ChunksSlots) {
    if( this.ibl !== null ){
      slots.add('pf',this.preCode(this) );
      slots.add('lightsf',this.code(this) );
    }
  }
}


// =================================
//          ABSTRACT LIGHT DATA
// =================================

abstract class LightDatas<TLight extends Light> extends Chunk {

  type: LightType
  lights: TLight[]
  shadowIndices: number[];

  preCodeTemplate: GlslCode;
  codeTemplate   : GlslCode;


  constructor( code : GlslCode, preCode : GlslCode) {
    super(true, true);

    this.type = LightType.UNKNOWN;
    this.lights = [];
    this.shadowIndices = [];
    this.preCodeTemplate = preCode;
    this.codeTemplate    = code;
  }



  addLight(l: TLight) {
    if (this.lights.indexOf(l) === -1) {
      this.lights.push(l);
      this.shadowIndices.push(-1)
      this.invalidateCode();
    }
  }


  removeLight(l: TLight) {
    const i = this.lights.indexOf(l);
    if (i > -1) {
      this.lights.splice(i, 1);
      this.shadowIndices.splice(i, 1);
      this.invalidateCode()
    }
  }


  _genCode(slots: ChunksSlots) {

    let code = this.preCodeTemplate({
      count: this.lights.length
    });
    slots.add('pf', code);


    code = ''
    for (var i = 0; i < this.lights.length; i++) {
      code += this.genCodePerLights(this.lights[i], i, this.shadowIndices[i]);
    }

    slots.add('lightsf', code);
  }


  abstract genCodePerLights(light: TLight, index: number, shadowIndex: number): void;

  abstract update( model : ILightModel ) : void;




  setup(prg: Program) {
    for (var i = 0; i < this.shadowIndices.length; i++) {
      var si = this.shadowIndices[i]
      if (si > -1) {
        var tex = this.lights[i].getShadowmap( prg.gl );
        prg['tShadowMap' + si](tex);
      }
    }
  }

}


type BaseLightData = LightDatas<Light>

// =================================
//               SPOTS
// =================================


class SpotDatas extends LightDatas<SpotLight> {

  _directions: Float32Array | null
  _colors    : Float32Array | null
  _positions : Float32Array | null
  _cone      : Float32Array | null

  constructor(code : GlslCode, preCode : GlslCode) {
    super(code, preCode);

    this.type = LightType.SPOT;

    this._directions = null;
    this._colors = null;
    this._positions = null;
    this._cone = null;
  }





  genCodePerLights(light: SpotLight, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex,
      infinite: light.radius<=0,
    }
    return this.codeTemplate(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 4 !== n) {
      this._directions = new Float32Array(n * 4);
      this._colors     = new Float32Array(n * 4);
      this._positions  = new Float32Array(n * 3);
      this._cone       = new Float32Array(n * 2);
    }
  }


  update(model: StandardModel) {
    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._directions!.set(l._wdir       , i * 4)
      this._colors    !.set(l._color      , i * 4)
      this._positions !.set(l._wposition  , i * 3)
      this._cone      !.set(l._coneData   , i * 2)

      this._directions![i * 4 + 3] = l.radius;
      this._colors![i * 4 + 3] = l.iblShadowing;

      if (l._castShadows) {
        var shIndex = model.shadowChunk.addLight(l);
        if (this.shadowIndices[i] !== shIndex) {
          this.invalidateCode();
        }
        this.shadowIndices[i] = shIndex;
      } else {
        this.shadowIndices[i] = -1;
      }
    }

    this._invalid = true;
  }


  setup(prg: Program) {

    if (this.lights.length > 0) {
      super.setup(prg);

      prg.uLSpotDirections(this._directions);
      prg.uLSpotColors(this._colors);
      prg.uLSpotPositions(this._positions);
      prg.uLSpotCone(this._cone);

      this._invalid = false;
    }
  }

}

// =================================
//               DIRECTIONAL
// =================================

class DirDatas extends LightDatas<DirectionalLight> {

  _directions: Float32Array | null
  _colors: Float32Array | null

  constructor(code : GlslCode, preCode : GlslCode) {
    super(code, preCode);

    this.type = LightType.DIRECTIONAL;
    this._directions = null;
    this._colors = null;
  }



  genCodePerLights(light: Light, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex
    }
    return this.codeTemplate(o);
  }


  allocate(n: number) {

    if (this._colors === null || this._colors.length / 4 !== n) {
      this._directions = new Float32Array(n * 3);
      this._colors = new Float32Array(n * 4);
    }
  }


  update(model: StandardModel) {
    var lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._directions!.set(l._wdir, i * 3)
      this._colors!.set(l._color, i * 4)
      this._colors![i * 4 + 3] = l.iblShadowing;

      if (l._castShadows) {
        var shIndex = model.shadowChunk.addLight(l);
        if (this.shadowIndices[i] !== shIndex) {
          this.invalidateCode();
        }
        this.shadowIndices[i] = shIndex;
      } else {
        this.shadowIndices[i] = -1;
      }

    }

    this._invalid = true;
  }


  setup(prg: Program) {

    if (this.lights.length > 0) {
      super.setup(prg);

      prg.uLDirDirections(this._directions);
      prg.uLDirColors(this._colors);
      this._invalid = false;
    }
  }


}



// =================================
//               POINT
// =================================

class PointDatas extends LightDatas<PointLight> {

  _colors   : Float32Array | null;
  _positions: Float32Array | null;

  constructor(code : GlslCode, preCode : GlslCode) {
    super(code, preCode);

    this.type = LightType.POINT;

    this._colors = null;
    this._positions = null;
  }



  genCodePerLights(light: PointLight, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex,
      infinite: light.radius<=0,
    }
    return this.codeTemplate(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 3 !== n) {
      this._colors    = new Float32Array(n * 3);
      this._positions = new Float32Array(n * 4);
    }
  }


  update(model:StandardModel) {

    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._colors   !.set(l._color      , i * 3)
      this._positions!.set(l._wposition  , i * 4)

      this._positions![i*4+3] = l.radius;

      if (l._castShadows) {
        var shIndex = model.shadowChunk.addLight(l);
        if (this.shadowIndices[i] !== shIndex) {
          this.invalidateCode();
        }
        this.shadowIndices[i] = shIndex;
      } else {
        this.shadowIndices[i] = -1;
      }
    }

    this._invalid = true;
  }


  setup(prg: Program) {

    if (this.lights.length > 0) {
      super.setup(prg);

      prg.uLPointColors(this._colors);
      prg.uLPointPositions(this._positions);

      this._invalid = false;
    }
  }

}

export default StandardModel