import { GlslCode } from "../interfaces/GlslCode";
import IblPmrem from "./IBLPmrem";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import SH9 from "./SH9";
import SH7 from "./SH7";
export declare class IBLPmremModel extends AbstractLightModel<IblPmrem> {
    readonly type = LightType.IBL_PMREM;
    genCodePerLights(light: IblPmrem, index: number, shadowIndex: number): string;
    prepare(gl: GLContext, model: ILightModel): void;
    addLight(l: IblPmrem): void;
    getSHChunk(l: IblPmrem): SH7 | SH9;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
