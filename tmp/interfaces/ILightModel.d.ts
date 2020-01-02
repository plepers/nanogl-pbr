import Light from "../Light";
import Chunk from "../Chunk";
import LightSetup from "../LightSetup";
export default interface ILightModel {
    setLightSetup(ls: LightSetup): void;
    getLightSetup(): LightSetup;
    add(l: Light): void;
    remove(l: Light): void;
    update(): void;
    getChunks(): Chunk[];
}
