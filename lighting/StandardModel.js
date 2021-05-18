import Enum from '../Enum';
import Flag from '../Flag';
import Chunk from '../Chunk';
import { ShadowFiltering } from '../ShadowFilteringEnum';
import _dirPreCode from '../glsl/templates/standard/directional-lights-pre.frag';
import _spotPreCode from '../glsl/templates/standard/spot-lights-pre.frag';
import _pointPreCode from '../glsl/templates/standard/point-lights-pre.frag';
import _dirLightCode from '../glsl/templates/standard/directional-light.frag';
import _spotLightCode from '../glsl/templates/standard/spot-light.frag';
import _pointLightCode from '../glsl/templates/standard/point-light.frag';
import _shadPreCode from '../glsl/templates/standard/shadow-maps-pre.frag';
import _preLightCode from '../glsl/templates/standard/pre-light-setup.frag';
import _postLightCode from '../glsl/templates/standard/post-light-setup.frag';
import _iblPreCode from '../glsl/templates/standard/ibl-pre.frag';
import _iblPmrEmPreCode from '../glsl/templates/standard/ibl-pmrem-pre.frag';
import _iblCode from '../glsl/templates/standard/ibl.frag';
import DirectionalLightModel from './DirectionalLightModel';
import SpotLightModel from './SpotLightModel';
import PointLightModel from './PointLightModel';
import { IblModel } from './IblModel';
import { IBLPmremModel } from './IBLPmremModel';
class StandardModelCode {
    constructor() {
        this.dirPreCode = _dirPreCode;
        this.spotPreCode = _spotPreCode;
        this.pointPreCode = _pointPreCode;
        this.dirLightCode = _dirLightCode;
        this.spotLightCode = _spotLightCode;
        this.pointLightCode = _pointLightCode;
        this.shadPreCode = _shadPreCode;
        this.preLightCode = _preLightCode;
        this.postLightCode = _postLightCode;
        this.iblPreCode = _iblPreCode;
        this.iblPmremPreCode = _iblPmrEmPreCode;
        this.iblCode = _iblCode;
    }
}
class StandardModel {
    constructor(modelCode) {
        if (modelCode === undefined) {
            modelCode = new StandardModelCode();
        }
        this.modelCode = modelCode;
        this._datas = {};
        this._dataList = [];
        this._setup = null;
        this.preLightsChunk = new PreLightsChunk(this.modelCode.preLightCode);
        this.postLightsChunk = new PostLightsChunk(this.modelCode.postLightCode);
        this.shadowChunk = new ShadowsChunk(this);
        this.shadowFilter = new Enum('shadowFilter', ShadowFiltering);
        this.iblShadowing = new Flag('iblShadowing', false);
        this.registerLightModel(new PointLightModel(modelCode.pointLightCode, modelCode.pointPreCode));
        this.registerLightModel(new SpotLightModel(modelCode.spotLightCode, modelCode.spotPreCode));
        this.registerLightModel(new DirectionalLightModel(modelCode.dirLightCode, modelCode.dirPreCode));
        this.registerLightModel(new IblModel(modelCode.iblCode, modelCode.iblPreCode));
        this.registerLightModel(new IBLPmremModel(modelCode.iblCode, modelCode.iblPmremPreCode));
    }
    registerLightModel(model) {
        this._datas[model.type] = model;
        this._dataList.push(model);
    }
    getLightSetup() {
        return this._setup;
    }
    setLightSetup(ls) {
        this._setup = ls;
    }
    add(l) {
        var data = this._datas[l._type];
        data.addLight(l);
    }
    remove(l) {
        var data = this._datas[l._type];
        data.removeLight(l);
    }
    prepare(gl) {
        this.shadowChunk.shadowCount = 0;
        for (var i = 0; i < this._dataList.length; i++) {
            this._dataList[i].prepare(gl, this);
        }
        this.shadowChunk.check();
    }
    getChunks() {
        const res = [
            this.iblShadowing,
            this.shadowFilter,
            this.shadowChunk,
            this.preLightsChunk,
        ];
        for (var i = 0; i < this._dataList.length; i++) {
            res.push(this._dataList[i]);
        }
        res.push(this.postLightsChunk);
        return res;
    }
}
class PreLightsChunk extends Chunk {
    constructor(code) {
        super(true, false);
        this.code = code;
    }
    _genCode(slots) {
        slots.add('lightsf', this.code(this));
    }
}
class PostLightsChunk extends Chunk {
    constructor(code) {
        super(true, false);
        this.code = code;
    }
    _genCode(slots) {
        slots.add('lightsf', this.code(this));
    }
}
const MAX_SHADOWS = 4;
const AA = Math.PI / 4.0;
class ShadowsChunk extends Chunk {
    constructor(lightModel) {
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
    _genCode(slots) {
        if (this.shadowCount > 0) {
            slots.add('pf', this.lightModel.modelCode.shadPreCode(this));
        }
    }
    addLight(light) {
        const i = this.shadowCount;
        const lightSetup = this.lightModel.getLightSetup();
        this.shadowCount++;
        this._matrices.set(light.getShadowProjection(lightSetup.bounds), i * 16);
        this._texelBiasVector.set(light.getTexelBiasVector(), i * 4);
        const s = light.getShadowmapSize();
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
            this._umatrices = new Float32Array(this._matrices.buffer, 0, this.shadowCount * 16);
            this._utexelBiasVector = new Float32Array(this._texelBiasVector.buffer, 0, this.shadowCount * 4);
            this._ushadowmapSizes = new Float32Array(this._shadowmapSizes.buffer, 0, this.shadowCount * 2);
            this.invalidateCode();
        }
        this._invalid = true;
    }
    setup(prg) {
        if (this.shadowCount > 0) {
            prg.uShadowMatrices(this._umatrices);
            prg.uShadowTexelBiasVector(this._utexelBiasVector);
            prg.uShadowMapSize(this._ushadowmapSizes);
            if (prg.uShadowKernelRotation !== undefined) {
                prg.uShadowKernelRotation(1.0 * Math.cos(AA), 1.0 * Math.sin(AA));
            }
            this._invalid = false;
        }
    }
}
export default StandardModel;
