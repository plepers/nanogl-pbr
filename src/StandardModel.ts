
import Program from 'nanogl/program'

import Light            from './Light'
import Enum             from './Enum'
import Flag             from './Flag'
import LightSetup       from './LightSetup'
import ILightModel      from './interfaces/ILightModel'
import ChunkSlots       from './ChunksSlots'
import LightType        from './LightType'
import SpotLight        from './SpotLight'
import DirectionalLight from './DirectionalLight'
import PointLight       from './PointLight'
import Chunk from './Chunk'
import { ShadowFilteringEnum, ShadowFiltering } from './ShadowFilteringEnum'

import dirPreCode from './glsl/templates/standard/directional-lights-pre.frag'
import spotPreCode from './glsl/templates/standard/spot-lights-pre.frag'
import pointPreCode from './glsl/templates/standard/point-lights-pre.frag'

import dirLightCode from './glsl/templates/standard/directional-light.frag'
import spotLightCode from './glsl/templates/standard/spot-light.frag'
import pointLightCode from './glsl/templates/standard/point-light.frag'

import shadPreCode from './glsl/templates/standard/shadow-maps-pre.frag'
import preLightCode from './glsl/templates/standard/pre-light-setup.frag'
import postLightCode from './glsl/templates/standard/post-light-setup.frag'




// =================================
//          Light Model
// =================================

class StandardModel implements ILightModel {
  

  preLightsChunk: PreLightsChunk;
  postLightsChunk: PostLightsChunk;
  shadowChunk: ShadowsChunk;
  shadowFilter: ShadowFilteringEnum

  iblShadowing: Flag;

  private _datas: Record<string, BaseLightData>;
  private _dataList: BaseLightData[];
  private _setup: LightSetup | null;

  constructor() {

    this._datas = {}
    this._dataList = []
    this._setup = null;


    this.preLightsChunk = new PreLightsChunk();
    this.postLightsChunk = new PostLightsChunk();
    this.shadowChunk = new ShadowsChunk(this);

    this.shadowFilter = new Enum('shadowFilter', ShadowFiltering );

    // damp renv reflexion for shadowed pixel
    this.iblShadowing = new Flag('iblShadowing', false);

    let d: BaseLightData;

    d = new DirDatas()
    this._datas[LightType.DIRECTIONAL] = d;
    this._dataList.push(d);

    d = new SpotDatas()
    this._datas[LightType.SPOT] = d;
    this._dataList.push(d);

    d = new PointDatas()
    this._datas[LightType.POINT] = d;
    this._dataList.push(d);

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


  constructor() {
    super(true, false);
  }



  _genCode(slots: ChunkSlots) {
    const code = preLightCode(this)
    slots.add('lightsf', code);
  }


  _getHash() {
    return '0';
  }
}

// =================================
//          POST LIGHT CHUNK
// =================================


class PostLightsChunk extends Chunk {

  constructor() {
    super(true, false);
  }

  _genCode(slots: ChunkSlots) {
    const code = postLightCode(this)
    slots.add('lightsf', code);
  }

  _getHash() {
    return '0';
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



  _genCode(slots: ChunkSlots) {

    if (this.shadowCount > 0) {
      slots.add('pf', shadPreCode(this));
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


  _getHash() {
    return '' + this.shadowCount;
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

// =================================
//          ABSTRACT LIGHT DATA
// =================================

abstract class LightDatas<TLight extends Light> extends Chunk {

  type: LightType
  lights: TLight[]
  shadowIndices: number[];

  preCodeTemplate: null | ((a: any) => string);


  constructor() {
    super(true, true);

    this.type = LightType.UNKNOWN;
    this.lights = [];
    this.shadowIndices = [];
    this.preCodeTemplate = null;
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


  _genCode(slots: ChunkSlots) {

    let code = this.preCodeTemplate!({
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



  _getHash() {
    let h = this.type + '' + this.lights.length;
    for (var i = 0; i < this.lights.length; i++) {
      if (this.lights[i]._castShadows) {
        h += i;
      }
    }
    return h;
  }


  setup(prg: Program) {
    for (var i = 0; i < this.shadowIndices.length; i++) {
      var si = this.shadowIndices[i]
      if (si > -1) {
        var tex = this.lights[i].getShadowmap();
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
  _spot      : Float32Array | null
  _falloff   : Float32Array | null

  constructor() {
    super();

    this.type = LightType.SPOT;

    this._directions = null;
    this._colors = null;
    this._positions = null;
    this._spot = null;
    this._falloff = null;

    this.preCodeTemplate = spotPreCode;
  }





  genCodePerLights(light: Light, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex
    }
    return spotLightCode(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 4 !== n) {
      this._directions = new Float32Array(n * 3);
      this._colors = new Float32Array(n * 4);
      this._positions = new Float32Array(n * 3);
      this._spot = new Float32Array(n * 2);
      this._falloff = new Float32Array(n * 3);
    }
  }


  update(model: StandardModel) {
    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._directions!.set(l._wdir, i * 3)
      this._colors!.set(l._color, i * 4)
      this._positions!.set(l._wposition, i * 3)
      this._spot!.set(l._spotData, i * 2)
      this._falloff!.set(l._falloffData, i * 3)

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
      prg.uLSpotSpot(this._spot);
      prg.uLSpotFalloff(this._falloff);

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

  constructor() {
    super();

    this.type = LightType.DIRECTIONAL;
    this._directions = null;
    this._colors = null;
    this.preCodeTemplate = dirPreCode;
  }



  genCodePerLights(light: Light, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex
    }
    return dirLightCode(o);
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
  _falloff  : Float32Array | null;

  constructor() {
    super();

    this.type = LightType.POINT;

    this._colors = null;
    this._positions = null;
    this._falloff = null;

    this.preCodeTemplate = pointPreCode;
  }



  genCodePerLights(light: PointLight, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex
    }
    return pointLightCode(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 3 !== n) {
      this._colors    = new Float32Array(n * 3);
      this._positions = new Float32Array(n * 3);
      this._falloff   = new Float32Array(n * 3);
    }
  }


  update(model:StandardModel) {

    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._colors   !.set(l._color      , i * 3)
      this._positions!.set(l._wposition  , i * 3)
      this._falloff  !.set(l._falloffData, i * 3)

      // this._colors[i*4+3] = l.iblShadowing;

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
      prg.uLPointFalloff(this._falloff);

      this._invalid = false;
    }
  }

}

export default StandardModel