import Config from 'nanogl-state/config';
import ProgramCache from './program-cache';
import Enum from './enum';
import ChunksList from './chunks-tree';
import { mat4 } from 'gl-matrix';
import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import DepthFormat from './depth-format-enum';
const M4 = mat4.create();
class DepthPass {
    constructor(gl) {
        this.prg = null;
        this.inputs = new ChunksList();
        this.depthFormat = new Enum('depthFormat', DepthFormat);
        this.inputs.add(this.depthFormat);
        this.config = new Config();
        this._prgcache = ProgramCache.getCache(gl);
        this._uid = 'stddepth';
        this._precision = 'highp';
        this._vertSrc = VertShader();
        this._fragSrc = FragShader();
    }
    setLightSetup(setup) {
        var _a;
        this.depthFormat.proxy((_a = setup) === null || _a === void 0 ? void 0 : _a.depthFormat);
    }
    prepare(node, camera) {
        if (this.prg === null)
            return;
        if (this._isDirty()) {
            this.compile();
        }
        var prg = this.prg;
        prg.use();
        prg.setupInputs(this);
        camera.modelViewProjectionMatrix(M4, node._wmatrix);
        prg.uMVP(M4);
    }
    _isDirty() {
        return (this.prg === null || this.inputs._isDirty);
    }
    compile() {
        if (this.prg !== null) {
            this._prgcache.release(this.prg);
        }
        this.prg = this._prgcache.compile(this);
    }
}
export default DepthPass;
