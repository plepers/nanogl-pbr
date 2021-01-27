import Light from './Light';
import LightType from './LightType';
export default class IBLPmrem extends Light {
    constructor(env, sh) {
        super();
        this._type = LightType.IBL_PMREM;
        this.shMode = "SH9";
        this.specularExpo = 1.0;
        this.diffuseExpo = 1.0;
        this.env = env;
        this.sh = sh;
    }
    setupProgram(prg) {
        if (prg.tEnv)
            prg.tEnv(this.env);
        if (prg.uSHCoeffs)
            prg.uSHCoeffs(this.sh);
    }
}
