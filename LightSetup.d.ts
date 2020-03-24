import Bounds from './Bounds';
import StandardModel from './StandardModel';
import Light from './Light';
import ILightModel from './interfaces/ILightModel';
import { DepthFormatEnum } from './DepthFormatEnum';
import IBL from './Ibl';
import Chunk from './Chunk';
declare class LightSetup {
    _lights: Light[];
    depthFormat: DepthFormatEnum;
    bounds: Bounds;
    stdModel: StandardModel;
    _models: ILightModel[];
    _modelsMap: Record<string, ILightModel>;
    _ibl: IBL | null;
    constructor();
    set ibl(v: IBL | null);
    get ibl(): IBL | null;
    add(l: Light): void;
    remove(l: Light): void;
    update(): void;
    getChunks(modelId: string): Chunk[];
    _registerModel(id: string, model: ILightModel): void;
}
export default LightSetup;
