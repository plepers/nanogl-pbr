import DirectionalLight from "./DirectionalLight";
import LightType from "./LightType";
import Light from "./Light";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
import { ShadowMappedLightModel } from './AbstractLightModel';
import { GlslCode } from "../interfaces/GlslCode";
export default class DirectionalLightModel extends ShadowMappedLightModel<DirectionalLight> {
    readonly type = LightType.DIRECTIONAL;
    _directions: Float32Array | null;
    _colors: Float32Array | null;
    constructor(code: GlslCode, preCode: GlslCode);
    genCodePerLights(light: Light, index: number, shadowIndex: number): string;
    allocate(n: number): void;
    update(model: StandardModel): void;
    setup(prg: Program): void;
}
