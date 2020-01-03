import Program from 'nanogl/program';
import Light from './Light';
import Flag from './Flag';
import LightSetup from './LightSetup';
import ILightModel from './interfaces/ILightModel';
import ChunkSlots from './ChunksSlots';
import Chunk from './Chunk';
import { ShadowFilteringEnum } from './ShadowFilteringEnum';
declare class StandardModel implements ILightModel {
    preLightsChunk: PreLightsChunk;
    postLightsChunk: PostLightsChunk;
    shadowChunk: ShadowsChunk;
    shadowFilter: ShadowFilteringEnum;
    iblShadowing: Flag;
    private _datas;
    private _dataList;
    private _setup;
    constructor();
    getLightSetup(): LightSetup;
    setLightSetup(ls: LightSetup): void;
    add(l: Light): void;
    remove(l: Light): void;
    update(): void;
    getChunks(): Chunk[];
}
declare class PreLightsChunk extends Chunk {
    constructor();
    _genCode(slots: ChunkSlots): void;
    _getHash(): string;
}
declare class PostLightsChunk extends Chunk {
    constructor();
    _genCode(slots: ChunkSlots): void;
    _getHash(): string;
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
    _genCode(slots: ChunkSlots): void;
    addLight(light: Light): number;
    _getHash(): string;
    check(): void;
    setup(prg: Program): void;
}
export default StandardModel;
