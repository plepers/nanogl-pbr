import GLConfig from 'nanogl-state/config';
import ProgramCache from './ProgramCache';
import Input from './Input';
import Flag from './Flag';
import Enum from './Enum';
import Precision from './ShaderPrecision';
import Version from './ShaderVersion';
import ChunksList from './ChunkCollection';
import { mat4 } from 'gl-matrix';
import getVert from './glsl/pbr.vert';
import getFrag from './glsl/pbr.frag';
import { isWebgl2 } from 'nanogl/types';
import { GammaModes } from './GammaModeEnum';
const M4 = mat4.create();
const MAT_ID = 'std';
export default class StandardMaterial {
    constructor(gl) {
        this.ibl = null;
        this.prg = null;
        this._mask = 1;
        const webgl2 = isWebgl2(gl);
        this.inputs = new ChunksList();
        this.version = this.inputs.add(new Version(webgl2 ? '300 es' : '100'));
        this.precision = this.inputs.add(new Precision('mediump'));
        this.shaderid = this.inputs.add(new Flag('id_' + MAT_ID, true));
        this.iAlbedo = this.inputs.add(new Input('albedo', 3));
        this.iSpecular = this.inputs.add(new Input('specular', 3));
        this.iGloss = this.inputs.add(new Input('gloss', 1));
        this.iNormal = this.inputs.add(new Input('normal', 3));
        this.iOcclusion = this.inputs.add(new Input('occlusion', 1));
        this.iCavity = this.inputs.add(new Input('cavity', 1));
        this.iCavityStrength = this.inputs.add(new Input('cavityStrength', 2));
        this.iEmissive = this.inputs.add(new Input('emissive', 1));
        this.iEmissiveScale = this.inputs.add(new Input('emissiveScale', 1));
        this.iFresnel = this.inputs.add(new Input('fresnel', 3));
        this.iGamma = this.inputs.add(new Input('gamma', 1));
        this.iExposure = this.inputs.add(new Input('exposure', 1));
        this.conserveEnergy = this.inputs.add(new Flag('conserveEnergy', true));
        this.perVertexIrrad = this.inputs.add(new Flag('perVertexIrrad', false));
        this.glossNearest = this.inputs.add(new Flag('glossNearest', false));
        this.useDerivatives = this.inputs.add(new Flag('useDerivatives', false));
        this.gammaMode = this.inputs.add(new Enum('gammaMode', GammaModes));
        this.config = new GLConfig();
        this._prgcache = ProgramCache.getCache(gl);
        this._vertSrc = getVert();
        this._fragSrc = getFrag();
    }
    setIBL(ibl) {
        this.ibl = ibl;
    }
    setLightSetup(setup) {
        this.inputs.addChunks(setup.getChunks('std'));
    }
    prepare(node, camera) {
        if (this._isDirty()) {
            this.compile();
        }
        var prg = this.prg;
        prg.use();
        prg.setupInputs(this);
        this.ibl.setupProgram(prg);
        camera.modelViewProjectionMatrix(M4, node._wmatrix);
        prg.uMVP(M4);
        prg.uWorldMatrix(node._wmatrix);
        prg.uCameraPosition(camera._wposition);
    }
    _isDirty() {
        if (this.prg === null || this.inputs._isDirty) {
            return true;
        }
        return false;
    }
    compile() {
        if (this.prg !== null) {
            this._prgcache.release(this.prg);
        }
        this.prg = this._prgcache.compile(this);
    }
}
;
