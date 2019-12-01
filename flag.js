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
        val = !!val;
        if (this._val !== val) {
            this._val = val;
            this.invalidate();
        }
    }
    genCode(slots) {
        let c;
        c = '#define ' + this.name + ' ' + (~~this._val) + '\n';
        slots.add('definitions', c);
    }
    getHash() {
        return this.name + '-' +
            (~~this._val);
    }
}
export default Flag;
