import Chunk from './Chunk';
import { hashString } from './Hash';
function defReducer(res, v, i) {
    res += `#define ${v} ${i + 1}\n`;
    return res;
}
class Enum extends Chunk {
    constructor(name, penum) {
        super(true, false);
        this.name = name;
        this.values = penum;
        this._valIndex = 0;
        this._val = this.values[0];
        this._enumDefs = this.values.reduce(defReducer, '');
        this._accesDef = `#define ${this.name}(k) VAL_${this.name} == k`;
    }
    set(val) {
        if (this._val === val) {
            return;
        }
        const idx = this.values.indexOf(val);
        if (idx === -1) {
            throw new Error(`invalide Enum value :${val}`);
        }
        if (this._valIndex !== idx) {
            this._valIndex = idx;
            this._val = val;
            this.invalidateCode();
        }
    }
    _genCode(slots) {
        const c = [
            this._enumDefs,
            `#define VAL_${this.name} ${this._val}`,
            this._accesDef
        ].join('\n');
        slots.add('definitions', c);
    }
    _getHash() {
        return hashString(`${this.name}${this._val}`);
    }
}
export default Enum;
