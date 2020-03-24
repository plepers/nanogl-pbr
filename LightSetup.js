import Enum from './Enum';
import Bounds from './Bounds';
import StandardModel from './StandardModel';
import DepthFormat from './DepthFormatEnum';
class LightSetup {
    constructor() {
        this._ibl = null;
        this._lights = [];
        this._models = [];
        this._modelsMap = {};
        this.depthFormat = new Enum('depthFormat', DepthFormat);
        this.bounds = new Bounds();
        this.stdModel = new StandardModel();
        this._registerModel('std', this.stdModel);
    }
    set ibl(v) {
        this._ibl = v;
        for (var i = 0; i < this._models.length; i++) {
            this._models[i].setIbl(v);
        }
    }
    get ibl() {
        return this._ibl;
    }
    add(l) {
        if (this._lights.indexOf(l) === -1) {
            this._lights.push(l);
            for (var i = 0; i < this._models.length; i++) {
                this._models[i].add(l);
            }
        }
    }
    remove(l) {
        var i = this._lights.indexOf(l);
        if (i > -1) {
            this._lights.splice(i, 1);
            for (i = 0; i < this._models.length; i++) {
                this._models[i].remove(l);
            }
        }
    }
    update() {
        for (var i = 0; i < this._models.length; i++) {
            this._models[i].update();
        }
    }
    getChunks(modelId) {
        if (modelId === undefined) {
            modelId = 'std';
        }
        var res = this._modelsMap[modelId].getChunks();
        res.unshift(this.depthFormat);
        return res;
    }
    _registerModel(id, model) {
        if (this._modelsMap[id] === undefined) {
            this._modelsMap[id] = model;
            this._models.push(model);
            model.setLightSetup(this);
            for (var i = 0; i < this._lights.length; i++) {
                model.add(this._lights[i]);
            }
        }
    }
}
export default LightSetup;
