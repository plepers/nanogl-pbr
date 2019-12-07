import Light from './light';
import Camera from 'nanogl-camera';
import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Bounds from './bounds';
declare class PointLight extends Light {
    private _radius;
    private _falloffCurve;
    _falloffData: Float32Array;
    constructor(gl: GLContext);
    castShadows(flag: boolean): void;
    _updateFalloffData(): void;
    get radius(): number;
    set radius(v: number);
    get falloffCurve(): number;
    set falloffCurve(v: number);
    projectionFromBounds(bounds: Bounds): mat4;
    _createCamera(): Camera;
    getTexelBiasVector(): Float32Array;
}
export default PointLight;
