import { GlslCode } from "../interfaces/GlslCode";
import IBL from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import SH9 from "./SH9";
import SH7 from "./SH7";
export declare class IblModel extends AbstractLightModel<IBL> {
    readonly type = LightType.IBL;
    genCodePerLights(light: IBL, index: number, shadowIndex: number): string;
    prepare(gl: GLContext, model: ILightModel): void;
    addLight(l: IBL): void;
    getSHChunk(l: IBL): SH9 | SH7;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
