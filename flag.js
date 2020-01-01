import Chunk from './chunk';
class Flag extends Chunk {
    constructor(name, val = false) {
        super(true, false);
        this.name = name;
        this._val = !!val;
    }
    enable() {
        this.set(true);
    }
    disable() {
        this.set(false);
    }
    set(val = false) {
        if (this._val !== val) {
            this._val = val;
            this.invalidate();
        }
    }
    _genCode(slots) {
        const c = `#define ${this.name} ${~~this._val}\n`;
        slots.add('definitions', c);
    }
    _getHash() {
        return `${this.name}-${~~this._val}`;
    }
}
export default Flag;
