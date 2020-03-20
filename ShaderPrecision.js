import Chunk from './Chunk';
import { hashString } from './Hash';
class ShaderPrecision extends Chunk {
    constructor(p = 'mediump') {
        super(true, false);
        this.fprecision = p;
    }
    set(p) {
        this.fprecision = p;
    }
    _getHash() {
        return hashString(this.fprecision);
    }
    _genCode(slots) {
        const s = `precision ${this.fprecision} float;\n`;
        slots.add('precision', s);
    }
}
export default ShaderPrecision;
