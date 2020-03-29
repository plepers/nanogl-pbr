import Light from './Light';
import Camera from 'nanogl-camera';
import { mat4 } from 'gl-matrix';
import Bounds from './Bounds';
declare class PointLight extends Light {
    private _radius;
    constructor();
    castShadows(flag: boolean): void;
    get radius(): number;
    set radius(v: number);
    projectionFromBounds(bounds: Bounds): mat4;
    _createCamera(): Camera;
    getTexelBiasVector(): Float32Array;
}
export default PointLight;
