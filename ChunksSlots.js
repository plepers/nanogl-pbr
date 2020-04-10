import { mergeHash, hashString } from "./Hash";
class HashedChunkCode {
    constructor(code) {
        this.code = code;
        this.hash = hashString(code);
    }
}
class ChunkSlot {
    constructor(key) {
        this._hash = 0;
        this.hashset = new Set();
        this.codes = [];
        this._code = '';
        this.key = key;
    }
    add(code) {
        if (!this.hashset.has(code.hash)) {
            this.hashset.add(code.hash);
            this.codes.push(code);
            this._code += code.code + '\n';
            this._hash = mergeHash(this._hash, code.hash);
        }
    }
    merge(other) {
        for (const hcc of other.codes) {
            this.add(hcc);
        }
    }
    get code() {
        return this._code;
    }
    get hash() {
        return this._hash;
    }
}
export default class ChunksSlots {
    constructor() {
        this.hash = 0;
        this.slots = [];
        this.slotsMap = {};
    }
    getHash() {
        let hash = 0;
        for (const slot of this.slots) {
            hash = mergeHash(hash, slot.hash);
        }
        return hash;
    }
    getSlot(id) {
        var s = this.slotsMap[id];
        if (s === undefined) {
            s = new ChunkSlot(id);
            this.slotsMap[id] = s;
            this.slots.push(s);
        }
        return s;
    }
    add(slotId, code) {
        this.getSlot(slotId).add(new HashedChunkCode(code));
    }
    merge(other) {
        for (var slot of other.slots) {
            this.getSlot(slot.key).merge(slot);
        }
    }
}
;
