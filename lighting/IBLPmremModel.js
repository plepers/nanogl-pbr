import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import SH9 from "./SH9";
import SH7 from "./SH7";
export class IblPmremModel extends AbstractLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.IBL_PMREM;
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
        this.addChild(this.getSHChunk(l));
    }
    getSHChunk(l) {
        return l.shMode === "SH7" ? new SH7() : new SH9();
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
