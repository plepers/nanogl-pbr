import { vec3 } from 'gl-matrix';
import Light from './Light';
import LightType from './LightType';
export default class Ibl extends Light {
    constructor(env, sh) {
        super();
        this.env = env;
        this.sh = sh;
        this._type = LightType.IBL;
        this.iblFormat = 'OCTA';
        this.hdrEncoding = "RGBM";
        this.shFormat = "SH9";
        this.mipLevels = 5;
        this.enableRotation = false;
        this.enableBoxProjection = false;
        this.intensity = 1.0;
        this.ambiantIntensity = 1.0;
        this.specularIntensity = 1.0;
        this.boxProjectionSize = vec3.fromValues(1, 1, 1);
        this.boxProjectionOffset = vec3.fromValues(0, 0, 0);
    }
}
