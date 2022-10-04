import { GlslCode } from "../interfaces/GlslCode";
import Ibl from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
export declare const IblFormats: readonly ["OCTA", "PMREM"];
export declare const ShFormats: readonly ["SH9", "SH7"];
export declare const HdrEncodings: readonly ["RGBM", "RGBD", "RGBE"];
export declare type IblFormat = typeof IblFormats[number];
export declare type ShFormat = typeof ShFormats[number];
export declare type HdrEncoding = typeof HdrEncodings[number];
export declare class IblModel extends AbstractLightModel<Ibl> {
    readonly type = LightType.IBL;
    private readonly enableRotation;
    private readonly enableBoxProjection;
    private readonly iblFormat;
    private readonly shFormat;
    private readonly hdrEncoding;
    genCodePerLights(light: Ibl, index: number, shadowIndex: number): string;
    prepare(gl: GLContext, model: ILightModel): void;
    addLight(l: Ibl): void;
    constructor(code: GlslCode, preCode: GlslCode);
    setup(prg: Program): void;
}
