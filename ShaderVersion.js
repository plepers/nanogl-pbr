import Chunk from './Chunk';
import { isWebgl2 } from "nanogl/types";
class ShaderVersion extends Chunk {
    constructor(v = '100') {
        super(true, false);
        this.version = v;
    }
    set(v) {
        if (this.version !== v) {
            this.version = v;
            this.invalidateCode();
        }
    }
    get() {
        return this.version;
    }
    _genCode(slots) {
        var s = `#version ${this.version}`;
        slots.add('version', s);
    }
    guessFromContext(gl) {
        this.set(isWebgl2(gl) ? '300 es' : '100');
    }
}
export default ShaderVersion;
