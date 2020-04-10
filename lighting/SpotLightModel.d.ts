import { ShadowMappedLightModel } from "./AbstractLightModel";
import SpotLight from "./SpotLight";
import { GlslCode } from "../interfaces/GlslCode";
import LightType from "./LightType";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
export default class SpotLightModel extends ShadowMappedLightModel<SpotLight> {
    readonly type = LightType.SPOT;
    _directions: Float32Array | null;
    _colors: Float32Array | null;
    _positions: Float32Array | null;
    _cone: Float32Array | null;
    constructor(code: GlslCode, preCode: GlslCode);
    genCodePerLights(light: SpotLight, index: number, shadowIndex: number): string;
    allocate(n: number): void;
    update(model: StandardModel): void;
    setup(prg: Program): void;
}
