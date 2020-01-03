export default class Chunk {
    constructor(hasCode = false, hasSetup = false) {
        this._ref = null;
        this._lists = new Set();
        this._hasCode = hasCode;
        this._hasSetup = hasSetup;
        this._invalid = true;
        this._children = [];
    }
    collectChunks(all, actives) {
        all.push(this);
        if (this._ref !== null) {
            this._ref.collectChunks(all, actives);
        }
        else {
            for (const child of this._children) {
                child.collectChunks(all, actives);
            }
            actives.push(this);
        }
    }
    addChild(child) {
        if (this._children.indexOf(child) > -1) {
            return child;
        }
        this._children.push(child);
        this.invalidateList();
        return child;
    }
    removeChild(child) {
        var i = this._children.indexOf(child);
        if (i > -1) {
            this._children.splice(i, 1);
        }
        this.invalidateList();
    }
    genCode(slots) {
        if (this._ref !== null) {
            this._ref.genCode(slots);
        }
        else {
            this._genCode(slots);
        }
    }
    getHash() {
        if (this._ref !== null) {
            return this._ref.getHash();
        }
        else {
            return this._getHash();
        }
    }
    get hasCode() {
        if (this._ref !== null) {
            return this._ref.hasCode;
        }
        else {
            return this._hasCode;
        }
    }
    get hasSetup() {
        if (this._ref !== null) {
            return this._ref.hasSetup;
        }
        else {
            return this._hasSetup;
        }
    }
    get isInvalid() {
        if (this._ref !== null) {
            return this._ref.isInvalid;
        }
        else {
            return this._invalid;
        }
    }
    setup(prg) {
    }
    addList(list) {
        this._lists.add(list);
    }
    removeList(list) {
        this._lists.delete(list);
    }
    invalidateList() {
        for (const l of this._lists.values()) {
            l.invalidateList();
        }
    }
    invalidateCode() {
        for (const l of this._lists.values()) {
            l.invalidateCode();
        }
    }
    proxy(ref = null) {
        if (this._ref === ref)
            return;
        this._ref = ref;
        this.invalidateList();
    }
    createProxy() {
        const Class = Chunk;
        const p = new Class();
        p.proxy(this);
        return p;
    }
}
