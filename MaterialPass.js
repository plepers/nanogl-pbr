import GLConfig from "nanogl-state/GLConfig";
import ChunkCollection from "./ChunkCollection";
export default class MaterialPass {
    constructor(shaderSource) {
        this.name = '';
        this.mask = ~0;
        this.glconfig = new GLConfig();
        this.inputs = new ChunkCollection();
        this._shaderSource = shaderSource;
    }
}
