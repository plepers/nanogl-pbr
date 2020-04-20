import Program from 'nanogl/program';
import Light, { ShadowMappedLight } from './Light';
import Flag from '../Flag';
import LightSetup from './LightSetup';
import ILightModel, { ILightModelCode } from '../interfaces/ILightModel';
import ChunksSlots from '../ChunksSlots';
import Chunk from '../Chunk';
import { ShadowFilteringEnum } from '../ShadowFilteringEnum';
import AbstractLightModel from './AbstractLightModel';
import { GlslCode } from '../interfaces/GlslCode';
import { GLContext } from 'nanogl/types';
declare class StandardModel implements ILightModel {
    modelCode: ILightModelCode;
    preLightsChunk: PreLightsChunk;
    postLightsChunk: PostLightsChunk;
    shadowChunk: ShadowsChunk;
    shadowFilter: ShadowFilteringEnum;
    iblShadowing: Flag;
    private _datas;
    private _dataList;
    private _setup;
    constructor(modelCode?: ILightModelCode);
    registerLightModel(model: AbstractLightModel): void;
    getLightSetup(): LightSetup;
    setLightSetup(ls: LightSetup): void;
    add(l: Light): void;
    remove(l: Light): void;
    prepare(gl: GLContext): void;
    getChunks(): Chunk[];
}
declare class PreLightsChunk extends Chunk {
    code: GlslCode;
    constructor(code: GlslCode);
    _genCode(slots: ChunksSlots): void;
}
declare class PostLightsChunk extends Chunk {
    code: GlslCode;
    constructor(code: GlslCode);
    _genCode(slots: ChunksSlots): void;
}
declare class ShadowsChunk extends Chunk {
    lightModel: StandardModel;
    shadowCount: number;
    genCount: number;
    _matrices: Float32Array;
    _texelBiasVector: Float32Array;
    _shadowmapSizes: Float32Array;
    _umatrices: Float32Array | null;
    _utexelBiasVector: Float32Array | null;
    _ushadowmapSizes: Float32Array | null;
    constructor(lightModel: StandardModel);
    _genCode(slots: ChunksSlots): void;
    addLight(light: ShadowMappedLight): number;
    check(): void;
    setup(prg: Program): void;
}
export default StandardModel;
