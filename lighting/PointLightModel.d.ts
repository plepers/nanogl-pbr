import AbstractLightModel from "./AbstractLightModel";
import PointLight from "./PointLight";
import { GlslCode } from "../interfaces/GlslCode";
import LightType from "./LightType";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
import { GLContext } from "nanogl/types";
export default class PointLightModel extends AbstractLightModel<PointLight> {
    readonly type = LightType.POINT;
    _colors: Float32Array | null;
    _positions: Float32Array | null;
    constructor(code: GlslCode, preCode: GlslCode);
    genCodePerLights(light: PointLight, index: number, shadowIndex: number): string;
    allocate(n: number): void;
    prepare(gl: GLContext, model: StandardModel): void;
    setup(prg: Program): void;
}
