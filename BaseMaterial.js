import GLConfig from 'nanogl-state/config';
import ProgramCache from './ProgramCache';
import ChunkCollection from './ChunkCollection';
import ChunkSlots from './ChunksSlots';
export class PassInstance {
    constructor(material, id, pass) {
        this._program = null;
        this._revision = 0;
        this.id = id;
        this.pass = pass;
        this.material = material;
    }
    getSourceRevision() {
        return this.pass.inputs.getRevision() + this.material.inputs.getRevision();
    }
    prepare(node, camera) {
        const prg = this.getProgram();
        prg.use();
        this.pass.inputs.setupProgram(prg);
        this.material.inputs.setupProgram(prg);
        this.pass.prepare(prg, node, camera);
        return prg;
    }
    getProgram() {
        const sourceRev = this.getSourceRevision();
        if (this._program === null || this._revision !== sourceRev) {
            this.compile();
            this._revision = sourceRev;
        }
        return this._program;
    }
    compile() {
        const pcache = this.material._prgcache;
        if (this._program !== null) {
            pcache.release(this._program);
        }
        const slots = new ChunkSlots();
        this.pass.inputs.getCode(slots);
        this.material.inputs.getCode(slots);
        const prgSource = {
            shaderSource: this.pass._shaderSource,
            slots: slots,
        };
        this._program = pcache.compile(prgSource);
    }
}
export default class BaseMaterial {
    constructor(gl, name = '') {
        this.mask = ~0;
        this.name = name;
        this.glconfig = new GLConfig();
        this.inputs = new ChunkCollection();
        this._prgcache = ProgramCache.getCache(gl);
        this._passMap = new Map();
        this._passes = [];
    }
    addPass(pass, id = 'color') {
        if (this._passMap.has(id)) {
            this.removePass(id);
        }
        const pInst = new PassInstance(this, id, pass);
        this._passMap.set(id, pInst);
        this._passes.push(pInst);
        return pInst;
    }
    removePass(id) {
        if (this._passMap.has(id)) {
            const p = this.getPass(id);
            this._passes.splice(this._passes.indexOf(p), 1);
            this._passMap.delete(id);
        }
    }
    getPass(id) {
        return this._passMap.get(id);
    }
    hasPass(id) {
        return this._passMap.has(id);
    }
    getAllPasses() {
        return this._passes;
    }
    getProgram(passId) {
        var _a;
        const pass = this.getPass(passId);
        return (_a = pass) === null || _a === void 0 ? void 0 : _a.getProgram();
    }
}
