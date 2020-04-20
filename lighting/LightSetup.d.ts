import Bounds from '../Bounds';
import StandardModel from './StandardModel';
import Light from './Light';
import ILightModel from '../interfaces/ILightModel';
import { DepthFormatEnum } from '../DepthFormatEnum';
import Chunk from '../Chunk';
import { GLContext } from 'nanogl/types';
declare class LightSetup {
    _lights: Light[];
    depthFormat: DepthFormatEnum;
    bounds: Bounds;
    stdModel: StandardModel;
    _models: ILightModel[];
    _modelsMap: Record<string, ILightModel>;
    constructor();
    add(l: Light): void;
    remove(l: Light): void;
    prepare(gl: GLContext): void;
    getChunks(modelId: string): Chunk[];
    _registerModel(id: string, model: ILightModel): void;
}
export default LightSetup;
