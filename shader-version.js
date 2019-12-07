import Chunk from './chunk';
class ShaderVersion extends Chunk {
    constructor(v = '100') {
        super(true, false);
        this.version = v;
    }
    set(v) {
        this.version = v;
        this.invalidate();
    }
    getHash() {
        return 'v' + this.version;
    }
    genCode(slots) {
        var s = `#version ${this.version}\n`;
        slots.add('version', s);
    }
}
export default ShaderVersion;
