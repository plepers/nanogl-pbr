import Program from 'nanogl/program';
const PRAGMA_SLOT = '#pragma SLOT';
const PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;
class ProgramCache {
    constructor(gl) {
        this.gl = gl;
        this._cache = {};
    }
    static getCache(gl) {
        const agl = gl;
        if (agl._prgcache === undefined) {
            agl._prgcache = new ProgramCache(gl);
        }
        return agl._prgcache;
    }
    compile(material) {
        const inputs = material.inputs;
        inputs.compile();
        const hash = inputs.getHash();
        const slots = inputs.getCode();
        const vert = this.processSlots(material._vertSrc, slots);
        const frag = this.processSlots(material._fragSrc, slots);
        const prg = new Program(this.gl, vert, frag);
        this._cache[hash] = prg;
        return prg;
    }
    release(prg) {
    }
    processSlots(source, slots) {
        for (const { code, key } of slots.slots) {
            source = source.replace(PRAGMA_SLOT + ' ' + key, code);
        }
        PRAGMA_REGEX.lastIndex = 0;
        source = source.replace(PRAGMA_REGEX, '');
        return source;
    }
}
;
export default ProgramCache;
