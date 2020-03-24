import Light from './Light';
import LightType from './LightType';
const BiasVector = new Float32Array(4);
class PointLight extends Light {
    constructor() {
        super();
        this._type = LightType.POINT;
        this._falloffData = new Float32Array(3);
        this._radius = 0.0;
        this._falloffCurve = 0.0;
        this.radius = 50.0;
        this.falloffCurve = 2.0;
    }
    castShadows(flag) {
        return;
    }
    _updateFalloffData() {
        this._falloffData[0] = -this._falloffCurve;
        this._falloffData[1] = -1 + this._falloffCurve;
        this._falloffData[2] = 1 / this._radius;
    }
    get radius() { return this._radius; }
    set radius(v) {
        this._radius = v;
        this._updateFalloffData();
    }
    get falloffCurve() { return this._falloffCurve; }
    set falloffCurve(v) {
        this._falloffCurve = v;
        this._updateFalloffData();
    }
    projectionFromBounds(bounds) {
        throw new Error("Shadow mapping not supported on point lights");
    }
    _createCamera() {
        throw new Error("Shadow mapping not supported on point lights");
    }
    getTexelBiasVector() {
        throw new Error("Shadow mapping not supported on point lights");
    }
}
export default PointLight;
