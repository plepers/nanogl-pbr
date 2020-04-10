import { ShadowMappedLight } from './Light';
import Camera from 'nanogl-camera';
import LightType from './LightType';
import Bounds from '../Bounds';
import OrthographicLens from 'nanogl-camera/ortho-lens';
import PunctualLight from './PunctualLight';
declare class DirectionalLight extends PunctualLight implements ShadowMappedLight {
    readonly _type = LightType.DIRECTIONAL;
    _shadowmapNearOffset: number;
    _camera: Camera<OrthographicLens> | null;
    constructor();
    projectionFromBounds(bounds: Bounds): void;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera<OrthographicLens>;
}
export default DirectionalLight;
