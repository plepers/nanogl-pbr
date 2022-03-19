import { GlslCode } from "../interfaces/GlslCode";
import Ibl from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import SH9 from "./SH9";
import SH7 from "./SH7";
import Flag from "../Flag";
export declare class IblModel extends AbstractLightModel<Ibl> {
    readonly type = LightType.IBL;
    enableRotation: Flag;
    genCodePerLights(light: Ibl, index: number, shadowIndex: number): string;
    prepare(gl: GLContext, model: ILightModel): void;
    addLight(l: Ibl): void;
    getSHChunk(l: Ibl): SH9 | SH7;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
