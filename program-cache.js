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
        const cached = this._cache[hash];
        if (cached !== undefined) {
            cached.usage++;
            return cached;
        }
        const slots = inputs.getCode();
        const vert = this.processSlots(material._vertSrc, slots);
        const frag = this.processSlots(material._fragSrc, slots);
        const prg = new Program(this.gl, vert, frag);
        prg._usage++;
        this._cache[hash] = prg;
        return prg;
    }
    release(prg) {
    }
    _addProgram(prg, hash) {
        this._cache[hash] = prg;
    }
    processSlots(code, slots) {
        for (var i = 0; i < slots.slots.length; i++) {
            var scode = slots.slots[i].code;
            var key = slots.slots[i].key;
            code = code.replace(PRAGMA_SLOT + ' ' + key, scode);
        }
        PRAGMA_REGEX.lastIndex = 0;
        code = code.replace(PRAGMA_REGEX, '');
        return code;
    }
}
;
export default ProgramCache;
