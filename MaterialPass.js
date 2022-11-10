import GLConfig from "nanogl-state/GLConfig";
import ChunkCollection from "./ChunkCollection";
export default class MaterialPass {
    constructor(_shaderSource) {
        this._shaderSource = _shaderSource;
        this.name = '';
        this.mask = ~0;
        this.glconfig = new GLConfig();
        this.inputs = new ChunkCollection();
    }
}
