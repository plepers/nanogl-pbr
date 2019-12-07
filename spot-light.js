import Light from './light';
import Camera from 'nanogl-camera';
import LightType from './light-types';
const BiasVector = new Float32Array(4);
class SpotLight extends Light {
    constructor(gl) {
        super(gl);
        this._camera = null;
        this._type = LightType.SPOT;
        this._spotData = new Float32Array(2);
        this._falloffData = new Float32Array(3);
        this._angle = 0.0;
        this._sharpness = 0.0;
        this._radius = 0.0;
        this._falloffCurve = 0.0;
        this.angle = Math.PI / 4;
        this.sharpness = 0.0;
        this.radius = 50.0;
        this.falloffCurve = 2.0;
    }
    projectionFromBounds(bounds) {
        const oBounds = this.boundsInLocalSpace(bounds);
        let zMin = -oBounds[2], zMax = -oBounds[5];
        zMin = Math.min(zMin, 1 / this._falloffData[2]);
        zMax = Math.max(0.005 * zMin, zMax);
        const lens = this._camera.lens;
        lens.near = zMax;
        lens.far = zMin;
    }
    getTexelBiasVector() {
        var mtx = this._camera._view;
        var zMin = -2.0 * Math.tan(this._angle);
        BiasVector[0] = mtx[2] * zMin;
        BiasVector[1] = mtx[6] * zMin;
        BiasVector[2] = mtx[10] * zMin;
        BiasVector[3] = mtx[14] * zMin;
        return BiasVector;
    }
    _createCamera() {
        var cam = Camera.makePerspectiveCamera();
        cam.lens.aspect = 1;
        cam.lens.fov = this._angle;
        cam.lens.near = 15 - 5;
        cam.lens.far = 15 + 5;
        return cam;
    }
    get angle() { return this._angle; }
    set angle(v) {
        this._angle = v;
        this._updateSpotData();
        if (this._castShadows) {
            this._camera.lens.fov = this._angle;
        }
    }
    get sharpness() { return this._sharpness; }
    set sharpness(v) {
        this._sharpness = v;
        this._updateSpotData();
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
    _updateSpotData() {
        this._spotData[0] = 1.0 + (this._sharpness * 100.0);
        this._spotData[1] = 2 / (1 - Math.cos(this._angle)) * this._spotData[0];
    }
    _updateFalloffData() {
        this._falloffData[0] = -this._falloffCurve;
        this._falloffData[1] = -1 + this._falloffCurve;
        this._falloffData[2] = 1 / this._radius;
    }
}
export default SpotLight;
