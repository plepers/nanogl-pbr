import Program from 'nanogl/program';
import Light from './Light';
import Flag from './Flag';
import LightSetup from './LightSetup';
import ILightModel, { ILightModelCode } from './interfaces/ILightModel';
import ChunksSlots from './ChunksSlots';
import Chunk from './Chunk';
import { ShadowFilteringEnum } from './ShadowFilteringEnum';
import IBL from './Ibl';
declare type GlslCode = (o: any) => string;
declare class StandardModel implements ILightModel {
    modelCode: ILightModelCode;
    preLightsChunk: PreLightsChunk;
    postLightsChunk: PostLightsChunk;
    shadowChunk: ShadowsChunk;
    shadowFilter: ShadowFilteringEnum;
    iblShadowing: Flag;
    iblChunk: IblChunk;
    private _datas;
    private _dataList;
    private _setup;
    constructor(modelCode?: ILightModelCode);
    setIbl(ibl: IBL | null): void;
    getLightSetup(): LightSetup;
    setLightSetup(ls: LightSetup): void;
    add(l: Light): void;
    remove(l: Light): void;
    update(): void;
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
    addLight(light: Light): number;
    check(): void;
    setup(prg: Program): void;
}
declare class IblChunk extends Chunk {
    preCode: GlslCode;
    code: GlslCode;
    ibl: IBL | null;
    constructor(code: GlslCode, preCode: GlslCode);
    setIbl(ibl: IBL | null): void;
    setup(prg: Program): void;
    _genCode(slots: ChunksSlots): void;
}
export default StandardModel;
