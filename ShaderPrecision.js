import Chunk from './Chunk';
class ShaderPrecision extends Chunk {
    constructor(p = 'mediump') {
        super(true, false);
        this.fprecision = p;
    }
    set(p) {
        this.fprecision = p;
    }
    _getHash() {
        return 'p' + this.fprecision;
    }
    _genCode(slots) {
        const s = `precision ${this.fprecision} float;\n`;
        slots.add('precision', s);
    }
}
export default ShaderPrecision;
