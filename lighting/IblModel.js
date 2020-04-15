import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
export class IblModel extends AbstractLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.IBL;
    }
    genCodePerLights(light, index, shadowIndex) {
        return this.codeTemplate(this);
    }
    prepare(gl, model) {
    }
    addLight(l) {
        if (this.lights.length > 0) {
            throw new Error("IblModel support only one Ibl Light");
        }
        super.addLight(l);
    }
    setup(prg) {
        if (this.lights.length > 0) {
            const ibl = this.lights[0];
            if (prg.tEnv)
                prg.tEnv(ibl.env);
            if (prg.uSHCoeffs)
                prg.uSHCoeffs(ibl.sh);
        }
    }
}
