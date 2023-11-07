import Light, { ShadowMappedLight } from "./Light";
import Chunk from "../Chunk";
import LightType from "./LightType";
import ChunksSlots from "../ChunksSlots";
import ILightModel from "../interfaces/ILightModel";
import Program from "nanogl/program";
import { GlslCode } from "../interfaces/GlslCode";
import { GLContext } from "nanogl/types";
export default abstract class AbstractLightModel<TLight extends Light = Light> extends Chunk {
    abstract readonly type: LightType;
    lights: TLight[];
    shadowIndices: number[];
    preCodeTemplate: GlslCode;
    codeTemplate: GlslCode;
    constructor(code: GlslCode, preCode: GlslCode);
    addLight(l: TLight): void;
    removeLight(l: TLight): void;
    _genCode(slots: ChunksSlots): void;
    abstract genCodePerLights(light: TLight, index: number, shadowIndex: number): string;
    abstract prepare(gl: GLContext, model: ILightModel): void;
}
type _ShadowMappedLight = ShadowMappedLight & Light;
export declare abstract class ShadowMappedLightModel<TLight extends _ShadowMappedLight> extends AbstractLightModel<TLight> {
    setup(prg: Program): void;
}
export {};
