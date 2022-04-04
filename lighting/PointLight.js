import LightType from './LightType';
import PunctualLight from './PunctualLight';
class PointLight extends PunctualLight {
    constructor() {
        super();
        this._type = LightType.POINT;
        this._radius = 0.0;
        this.radius = 50.0;
    }
    set castShadows(flag) {
        flag;
    }
    get radius() { return this._radius; }
    set radius(v) {
        this._radius = v;
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
