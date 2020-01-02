import Light from './Light';
import Camera from 'nanogl-camera';
import LightType from './LightType';
const BiasVector = new Float32Array(4);
class DirectionalLight extends Light {
    constructor(gl) {
        super(gl);
        this._camera = null;
        this._type = LightType.DIRECTIONAL;
        this._shadowmapNearOffset = 0;
    }
    projectionFromBounds(bounds) {
        const oBounds = this.boundsInLocalSpace(bounds);
        const camera = this._camera;
        camera.lens.near = -oBounds[5] - this._shadowmapNearOffset;
        camera.lens.far = -oBounds[2];
        camera.lens.setBound(oBounds[0], oBounds[3], oBounds[1], oBounds[4]);
    }
    getTexelBiasVector() {
        const ortho = this._camera.lens;
        BiasVector[3] = Math.max(ortho._xMax - ortho._xMin, ortho._yMax - ortho._yMin);
        return BiasVector;
    }
    _createCamera() {
        return Camera.makeOrthoCamera();
    }
}
export default DirectionalLight;
