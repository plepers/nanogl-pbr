import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
class RootChunk extends Chunk {
    _getHash() {
        return '';
    }
    _genCode(slots) { }
    constructor() {
        super();
    }
}
class ChunksTree {
    constructor() {
        this._chunks = [];
        this._all = [];
        this._actives = [];
        this._setups = [];
        this._isDirty = true;
    }
    add(chunk) {
        if (this._chunks.indexOf(chunk) === -1) {
            this._chunks.push(chunk);
            this._isDirty = true;
        }
        return chunk;
    }
    remove(chunk) {
        const i = this._chunks.indexOf(chunk);
        if (i > -1) {
            this._chunks.splice(i, 1);
            this._isDirty = true;
        }
    }
    addChunks(chunks) {
        for (const c of chunks) {
            this.add(c);
        }
    }
    compile() {
        this._collectChunks();
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
        this._isDirty = false;
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
;
export default ChunksTree;
