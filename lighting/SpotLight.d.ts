import { ShadowMappedLight } from './Light';
import Camera from 'nanogl-camera';
import LightType from './LightType';
import Bounds from '../Bounds';
import PerspectiveLens from 'nanogl-camera/perspective-lens';
import PunctualLight from './PunctualLight';
declare class SpotLight extends PunctualLight implements ShadowMappedLight {
    readonly _type = LightType.SPOT;
    private _innerAngle;
    private _outerAngle;
    private _radius;
    _attenuationData: Float32Array;
    _camera: Camera<PerspectiveLens> | null;
    constructor();
    projectionFromBounds(bounds: Bounds): void;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera<PerspectiveLens>;
    get innerAngle(): number;
    set innerAngle(v: number);
    get angle(): number;
    set angle(v: number);
    get outerAngle(): number;
    set outerAngle(v: number);
    get radius(): number;
    set radius(v: number);
    _updateSpotData(): void;
}
export default SpotLight;
