import ProgramCache from "./ProgramCache";
import ChunksSlots from "./ChunksSlots";
export default class ProgramSource {
    constructor(gl, shaderSource) {
        this._chunkCollections = [];
        this._program = null;
        this._revision = 0;
        this._shaderSource = shaderSource;
        this._prgCache = ProgramCache.getCache(gl);
    }
    addChunkCollection(chunkCollection) {
        this._chunkCollections.push(chunkCollection);
    }
    getSourceRevision() {
        let rev = 0;
        for (const collection of this._chunkCollections) {
            rev += collection.getRevision();
        }
        return rev;
    }
    setupProgram() {
        const prg = this.getProgram();
        prg.use();
        for (const collection of this._chunkCollections) {
            collection.setupProgram(prg);
        }
        return prg;
    }
    getProgram() {
        const sourceRev = this.getSourceRevision();
        if (this._program === null || this._revision !== sourceRev) {
            this.compile();
            this._revision = sourceRev;
        }
        return this._program;
    }
    compile() {
        const pcache = this._prgCache;
        if (this._program !== null) {
            pcache.release(this._program);
        }
        const slots = new ChunksSlots();
        for (const collection of this._chunkCollections) {
            collection.getCode(slots);
        }
        const prgSource = {
            shaderSource: this._shaderSource,
            slots: slots,
        };
        this._program = pcache.compile(prgSource);
    }
}
