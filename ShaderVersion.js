import Chunk from './Chunk';
import { hashString } from './Hash';
class ShaderVersion extends Chunk {
    constructor(v = '100') {
        super(true, false);
        this.version = v;
    }
    set(v) {
        this.version = v;
        this.invalidateCode();
    }
    get() {
        return this.version;
    }
    _getHash() {
        return hashString('v' + this.version);
    }
    _genCode(slots) {
        var s = `#version ${this.version}`;
        slots.add('version', s);
    }
}
export default ShaderVersion;
