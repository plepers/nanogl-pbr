import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import Flag from "../Flag";
import { mat3, vec3 } from "gl-matrix";
import Enum from "../Enum";
import Input from "../Input";
const M3 = mat3.create();
const V3 = vec3.create();
export const IblFormats = [
    "OCTA",
    "PMREM",
];
export const ShFormats = [
    "SH9",
    "SH7",
];
export const HdrEncodings = [
    "RGBM",
    "RGBD",
    "RGBE",
];
export class IblModel extends AbstractLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.IBL;
        this.enableRotation = new Flag("enableRotation");
        this.enableBoxProjection = new Flag("enableBoxProjection");
        this.iblFormat = new Enum("iblFormat", IblFormats);
        this.shFormat = new Enum("shFormat", ShFormats);
        this.hdrEncoding = new Enum("iblHdrEncoding", HdrEncodings);
        this.mipLevels = new Input("iblNumMipLevel", 1);
        this.mipLevelsValue = this.mipLevels.attachConstant(5);
        this.addChild(this.enableRotation);
        this.addChild(this.enableBoxProjection);
        this.addChild(this.iblFormat);
        this.addChild(this.shFormat);
        this.addChild(this.hdrEncoding);
        this.addChild(this.mipLevels);
    }
    genCodePerLights(light, index, shadowIndex) {
        this.enableRotation.set(light.enableRotation);
        return this.codeTemplate(this);
    }
    prepare(gl, model) {
        const ibl = this.lights[0];
        if (ibl) {
            this.enableRotation.set(ibl.enableRotation);
            this.enableBoxProjection.set(ibl.enableBoxProjection);
            this.iblFormat.set(ibl.iblFormat);
            this.shFormat.set(ibl.shFormat);
            this.hdrEncoding.set(ibl.hdrEncoding);
            this.mipLevelsValue.set(ibl.mipLevels);
        }
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
            prg.tEnv(ibl.env);
            prg.uSHCoeffs(ibl.sh);
            if (ibl.enableRotation) {
                mat3.fromMat4(M3, ibl._wmatrix);
                mat3.invert(M3, M3);
                prg.uEnvMatrix(M3);
            }
            if (ibl.enableBoxProjection) {
                vec3.scaleAndAdd(V3, ibl._wposition, ibl.boxProjectionSize, -0.5);
                prg.uBoxProjMin(V3);
                vec3.scaleAndAdd(V3, ibl._wposition, ibl.boxProjectionSize, 0.5);
                prg.uBoxProjMax(V3);
                vec3.add(V3, ibl._wposition, ibl.boxProjectionOffset);
                prg.uBoxProjPos(V3);
            }
        }
    }
}
