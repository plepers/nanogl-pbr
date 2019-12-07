import Chunk from './chunk';
class ShaderPrecision extends Chunk {
    constructor(p = 'mediump') {
        super(true, false);
        this.fprecision = p;
    }
    set(p) {
        this.fprecision = p;
    }
    getHash() {
        return 'p' + this.fprecision;
    }
    genCode(slots) {
        const s = `precision ${this.fprecision} float;\n`;
        slots.add('precision', s);
    }
}
export default ShaderPrecision;
