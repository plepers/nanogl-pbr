import Light from './light';
import Camera from 'nanogl-camera';
import { GLContext } from 'nanogl/types';
import Bounds from './bounds';
import OrthographicLens from 'nanogl-camera/ortho-lens';
declare class DirectionalLight extends Light {
    _shadowmapNearOffset: number;
    _camera: Camera<OrthographicLens> | null;
    constructor(gl: GLContext);
    projectionFromBounds(bounds: Bounds): void;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera<OrthographicLens>;
}
export default DirectionalLight;
