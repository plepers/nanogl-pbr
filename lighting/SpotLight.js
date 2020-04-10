import Camera from 'nanogl-camera';
import LightType from './LightType';
import PunctualLight from './PunctualLight';
const BiasVector = new Float32Array(4);
class SpotLight extends PunctualLight {
    constructor() {
        super();
        this._type = LightType.SPOT;
        this._innerAngle = 0;
        this._outerAngle = 0;
        this._radius = 0;
        this._camera = null;
        this._coneData = new Float32Array(2);
        this.outerAngle = Math.PI / 4;
        this.radius = 50.0;
    }
    projectionFromBounds(bounds) {
        const oBounds = this.boundsInLocalSpace(bounds);
        let zMin = -oBounds[2], zMax = -oBounds[5];
        zMin = Math.max(0.001, Math.min(zMin, this._radius));
        zMax = Math.max(0.005 + zMin, zMax);
        const lens = this._camera.lens;
        lens.near = zMax;
        lens.far = zMin;
    }
    getTexelBiasVector() {
        var mtx = this._camera._view;
        var zMin = -2.0 * Math.tan(this._outerAngle);
        BiasVector[0] = mtx[2] * zMin;
        BiasVector[1] = mtx[6] * zMin;
        BiasVector[2] = mtx[10] * zMin;
        BiasVector[3] = mtx[14] * zMin;
        return BiasVector;
    }
    _createCamera() {
        var cam = Camera.makePerspectiveCamera();
        cam.lens.aspect = 1;
        cam.lens.fov = this._outerAngle;
        cam.lens.near = 15 - 5;
        cam.lens.far = 15 + 5;
        return cam;
    }
    get innerAngle() { return this._innerAngle; }
    set innerAngle(v) {
        this._innerAngle = v;
        this._updateSpotData();
    }
    get angle() { return this._outerAngle; }
    set angle(v) { this.outerAngle = v; }
    get outerAngle() { return this._outerAngle; }
    set outerAngle(v) {
        this._outerAngle = v;
        this._updateSpotData();
        if (this._castShadows) {
            this._camera.lens.fov = this._outerAngle;
        }
    }
    get radius() { return this._radius; }
    set radius(v) {
        this._radius = v;
    }
    _updateSpotData() {
        this._coneData[0] = 1.0 / Math.max(0.001, Math.cos(this._innerAngle) - Math.cos(this._outerAngle));
        this._coneData[1] = -Math.cos(this._outerAngle) * this._coneData[0];
    }
}
export default SpotLight;
