import Bounds from './bounds';
import StandardModel from './standard-model';
import Light from './light';
import ILightModel from './interfaces/light-model';
import { DepthFormatEnum } from './depth-format-enum';
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
    update(): void;
    getChunks(modelId: string): import("./chunk").default[];
    _registerModel(id: string, model: ILightModel): void;
}
export default LightSetup;
