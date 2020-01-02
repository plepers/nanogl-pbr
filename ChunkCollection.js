import ChunkSlots from './ChunksSlots';
export default class ChunkCollection {
    constructor() {
        this._dirtyFlags = 3;
        this._chunks = [];
        this._all = [];
        this._actives = [];
        this._setups = [];
    }
    add(chunk) {
        if (this._chunks.indexOf(chunk) === -1) {
            this._chunks.push(chunk);
            this.invalidate(3);
        }
        return chunk;
    }
    remove(chunk) {
        const i = this._chunks.indexOf(chunk);
        if (i > -1) {
            this._chunks.splice(i, 1);
            this.invalidate(3);
        }
    }
    addChunks(chunks) {
        for (const c of chunks) {
            this.add(c);
        }
    }
    compile() {
        if ((this._dirtyFlags & 2) !== 0) {
            this._collectChunks();
        }
    }
    invalidate(flag) {
        this._dirtyFlags |= flag;
    }
    isInvalid() {
        return this._dirtyFlags !== 0;
    }
    _collectChunks() {
        const all = this._all, setups = this._setups, actives = this._actives;
        for (const chunk of all) {
            chunk.removeList(this);
        }
        actives.length = 0;
        all.length = 0;
        for (const chunk of this._chunks) {
            chunk.collectChunks(all, actives);
        }
        for (const chunk of actives) {
            chunk.hasSetup && setups.push(chunk);
        }
        for (const chunk of all) {
            chunk.addList(this);
        }
        this._dirtyFlags &= ~2;
    }
    setupProgram(prg) {
        for (const chunk of this._setups) {
            chunk.setup(prg);
        }
    }
    getHash() {
        let res = '';
        for (const chunk of this._actives) {
            if (chunk.hasCode)
                res += chunk.getHash();
        }
        return res;
    }
    getCode() {
        const slots = new ChunkSlots();
        for (const chunk of this._actives) {
            chunk.hasCode && chunk.genCode(slots);
        }
        return slots;
    }
}
