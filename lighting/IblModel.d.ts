import { GlslCode } from "../interfaces/GlslCode";
import IBL from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
export declare class IblModel extends AbstractLightModel<IBL> {
    readonly type = LightType.IBL;
    genCodePerLights(light: IBL, index: number, shadowIndex: number): string;
    update(model: ILightModel): void;
    addLight(l: IBL): void;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
