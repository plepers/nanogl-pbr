import ChunkSlots from './ChunksSlots';
export default class ChunkCollection {
    constructor() {
        this._invalidList = true;
        this._invalidCode = true;
        this._revision = 0;
        this._all = new Set();
        this._actives = new Set();
        this._chunks = [];
        this._setups = [];
        this._codes = [];
        this._cachedSlots = null;
    }
    add(chunk) {
        if (this._chunks.indexOf(chunk) === -1) {
            this._chunks.push(chunk);
            this.invalidateList();
        }
        return chunk;
    }
    remove(chunk) {
        const i = this._chunks.indexOf(chunk);
        if (i > -1) {
            this._chunks.splice(i, 1);
            this.invalidateList();
        }
    }
    addChunks(chunks) {
        for (const c of chunks) {
            this.add(c);
        }
    }
    invalidateList() {
        this._invalidList = true;
        this.invalidateCode();
    }
    invalidateCode() {
        if (!this._invalidCode) {
            this._invalidCode = true;
            this._revision++;
        }
    }
    isInvalid() {
        return this._invalidList || this._invalidCode;
    }
    getRevision() {
        return this._revision;
    }
    _collectChunks() {
        const all = this._all, setups = this._setups, codes = this._codes, actives = this._actives;
        for (const chunk of all) {
            chunk.removeList(this);
        }
        all.clear();
        actives.clear();
        setups.length = 0;
        codes.length = 0;
        for (const chunk of this._chunks) {
            chunk.collectChunks(all, actives);
        }
        for (const chunk of actives) {
            chunk.hasSetup && setups.push(chunk);
            chunk.hasCode && codes.push(chunk);
        }
        for (const chunk of all) {
            chunk.addList(this);
        }
        this._invalidList = false;
    }
    setupProgram(prg) {
        for (const chunk of this._setups) {
            chunk.setup(prg);
        }
    }
    getCode(base) {
        if (this._invalidList) {
            this._collectChunks();
        }
        if (this._cachedSlots === null || this._invalidCode) {
            const slots = new ChunkSlots();
            const hash = 0;
            for (const chunk of this._codes) {
                chunk.genCode(slots);
            }
            this._cachedSlots = slots;
            this._invalidCode = false;
        }
        if (base !== undefined) {
            base.merge(this._cachedSlots);
            return base;
        }
        return this._cachedSlots;
    }
}
