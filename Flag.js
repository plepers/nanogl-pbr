import Chunk from './Chunk';
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
            this.invalidateCode();
        }
    }
    _genCode(slots) {
        const c = `#define ${this.name} ${~~this._val}`;
        slots.add('definitions', c);
    }
}
export default Flag;
