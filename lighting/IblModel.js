import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import SH9 from "./SH9";
import SH7 from "./SH7";
import Flag from "../Flag";
import { mat3 } from "gl-matrix";
import Enum from "../Enum";
const M3 = mat3.create();
export const IblTypes = [
    "OCTA",
    "PMREM",
];
export class IblModel extends AbstractLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.IBL;
        this.enableRotation = new Flag("enableRotation");
        this._iblType = new Enum("iblType", IblTypes);
        this.addChild(this.enableRotation);
        this.addChild(this._iblType);
    }
    genCodePerLights(light, index, shadowIndex) {
        this.enableRotation.set(light.enableRotation);
        return this.codeTemplate(this);
    }
    prepare(gl, model) {
        const ibl = this.lights[0];
        if (ibl) {
            this.enableRotation.set(ibl.enableRotation);
        }
    }
    addLight(l) {
        if (this.lights.length > 0) {
            throw new Error("IblModel support only one Ibl Light");
        }
        this.addChild(this.getSHChunk(l));
        this._iblType.set(l.iblType);
        super.addLight(l);
    }
    getSHChunk(l) {
        return l.shMode === "SH7" ? new SH7() : new SH9();
    }
    setup(prg) {
        if (this.lights.length > 0) {
            const ibl = this.lights[0];
            prg.tEnv(ibl.env);
            prg.uSHCoeffs(ibl.sh);
            if (ibl.enableRotation) {
                mat3.fromMat4(M3, ibl._wmatrix);
                mat3.invert(M3, M3);
                prg.uEnvMatrix(M3);
            }
        }
    }
}
