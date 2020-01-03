import Light from './Light';
import Camera from 'nanogl-camera';
import Bounds from './Bounds';
import { GLContext } from 'nanogl/types';
import PerspectiveLens from 'nanogl-camera/perspective-lens';
declare class SpotLight extends Light {
    private _angle;
    private _sharpness;
    private _radius;
    private _falloffCurve;
    _spotData: Float32Array;
    _falloffData: Float32Array;
    _camera: Camera<PerspectiveLens> | null;
    constructor(gl: GLContext);
    projectionFromBounds(bounds: Bounds): void;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera<PerspectiveLens>;
    get angle(): number;
    set angle(v: number);
    get sharpness(): number;
    set sharpness(v: number);
    get radius(): number;
    set radius(v: number);
    get falloffCurve(): number;
    set falloffCurve(v: number);
    _updateSpotData(): void;
    _updateFalloffData(): void;
}
export default SpotLight;
