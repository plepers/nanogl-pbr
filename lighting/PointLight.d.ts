import Camera from 'nanogl-camera';
import { mat4 } from 'gl-matrix';
import LightType from './LightType';
import Bounds from '../Bounds';
import PunctualLight from './PunctualLight';
declare class PointLight extends PunctualLight {
    readonly _type = LightType.POINT;
    private _radius;
    constructor();
    set castShadows(flag: boolean);
    get radius(): number;
    set radius(v: number);
    projectionFromBounds(bounds: Bounds): mat4;
    _createCamera(): Camera;
    getTexelBiasVector(): Float32Array;
}
export default PointLight;
