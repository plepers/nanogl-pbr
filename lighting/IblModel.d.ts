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
import Enum from "../Enum";
import IblBase from "./IblBase";
export declare const IblTypes: readonly ["OCTA", "PMREM"];
export declare type IblType = typeof IblTypes[number];
export declare class IblModel extends AbstractLightModel<IblBase> {
    readonly type = LightType.IBL;
    enableRotation: Flag;
    _iblType: Enum<readonly ["OCTA", "PMREM"]>;
    genCodePerLights(light: Ibl, index: number, shadowIndex: number): string;
    prepare(gl: GLContext, model: ILightModel): void;
    addLight(l: IblBase): void;
    getSHChunk(l: IblBase): SH9 | SH7;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
