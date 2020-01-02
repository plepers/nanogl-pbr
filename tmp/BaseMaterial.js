import GLConfig from 'nanogl-state/config';
export default class BaseMaterial {
    constructor(name = '') {
        this.mask = ~0;
        this._vertSrc = '';
        this._fragSrc = '';
        this.name = name;
        this.glconfig = new GLConfig();
        this._passMap = new Map();
        this._passes = [];
    }
    addPass(id, pass) {
        if (this._passMap.has(id)) {
            this.removePass(id);
        }
        this._passMap.set(id, pass);
        this._passes.push(pass);
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
    addModifier(mod) {
    }
    getModifier(modid) {
    }
}
