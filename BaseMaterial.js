import GLConfig from 'nanogl-state/GLConfig';
import ChunkCollection from './ChunkCollection';
import ProgramSource from './ProgramSource';
export class PassInstance {
    constructor(material, pass) {
        this._program = null;
        this.programSource = new ProgramSource(material.gl, pass._shaderSource);
        this.programSource.addChunkCollection(material.inputs);
        this.programSource.addChunkCollection(pass.inputs);
        this.pass = pass;
        this.material = material;
    }
    prepare(node, camera) {
        const prg = this.programSource.setupProgram();
        this.pass.prepare(prg, node, camera);
        return prg;
    }
    getProgram() {
        return this.programSource.getProgram();
    }
}
export default class BaseMaterial {
    constructor(gl, name = '') {
        this.mask = ~0;
        this.gl = gl;
        this.name = name;
        this.glconfig = new GLConfig();
        this.inputs = new ChunkCollection();
        this._passMap = new Map();
        this._passes = [];
    }
    addPass(pass, id = 'color') {
        if (this._passMap.has(id)) {
            this.removePass(id);
        }
        const pInst = new PassInstance(this, pass);
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
    getPass(id = 'color') {
        return this._passMap.get(id);
    }
    hasPass(id) {
        return this._passMap.has(id);
    }
    getAllPasses() {
        return this._passes;
    }
    getProgram(passId) {
        const pass = this.getPass(passId);
        return pass === null || pass === void 0 ? void 0 : pass.getProgram();
    }
}
