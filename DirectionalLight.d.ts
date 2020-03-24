import Light from './Light';
import Camera from 'nanogl-camera';
import Bounds from './Bounds';
import OrthographicLens from 'nanogl-camera/ortho-lens';
declare class DirectionalLight extends Light {
    _shadowmapNearOffset: number;
    _camera: Camera<OrthographicLens> | null;
    constructor();
    projectionFromBounds(bounds: Bounds): void;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera<OrthographicLens>;
}
export default DirectionalLight;
