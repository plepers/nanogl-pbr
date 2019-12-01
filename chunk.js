class Chunk {
    constructor(hasCode = false, hasSetup = false) {
        this.list = null;
        this.children = [];
        this.parent = null;
        this._hasCode = hasCode;
        this._hasSetup = hasSetup;
        this._invalid = true;
        this._proxies = [];
    }
    setup(prg) {
    }
    add(child) {
        if (this.children.indexOf(child) > -1) {
            return child;
        }
        this.children.push(child);
        child.setList(this.list);
        child.parent = this;
        for (var i = 0; i < this._proxies.length; i++) {
            this._proxies[i].add(child.createProxy());
        }
        this.invalidate();
        return child;
    }
    remove(child) {
        var i = this.children.indexOf(child);
        if (i > -1) {
            this.children.splice(i, 1);
            child.parent = null;
            child.removeProxies();
        }
        this.invalidate();
    }
    setList(list) {
        this.list = list;
        this.invalidate();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].setList(list);
        }
    }
    traverse(setups, codes, chunks) {
        if (chunks.indexOf(this) === -1) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].traverse(setups, codes, chunks);
            }
            if (this._hasSetup) {
                setups.push(this);
            }
            if (this._hasCode) {
                codes.push(this);
            }
            chunks.push(this);
        }
    }
    invalidate() {
        if (this.list) {
            this.list._isDirty = true;
        }
        for (var i = 0; i < this._proxies.length; i++) {
            this._proxies[i].invalidate();
        }
    }
    createProxy() {
        var p = new ChunkProxy(this);
        for (var i = 0; i < this.children.length; i++) {
            p.add(this.children[i].createProxy());
        }
        this._proxies.push(p);
        return p;
    }
    releaseProxy(p) {
        var i = this._proxies.indexOf(p);
        if (i > -1) {
            this._proxies.splice(i, 1);
        }
    }
    removeProxies() {
        for (var i = 0; i < this._proxies.length; i++) {
            var p = this._proxies[i];
            if (p.parent !== null) {
                p.parent.remove(p);
            }
        }
    }
}
export class ChunkProxy extends Chunk {
    constructor(ref) {
        super(ref._hasCode, ref._hasSetup);
        this._ref = ref;
    }
    genCode(chunk) { this._ref.genCode(chunk); }
    getHash() { return this._ref.getHash(); }
    setup(prg) { this._ref.setup(prg); }
    release() {
        this._ref.releaseProxy(this);
    }
}
export default Chunk;
