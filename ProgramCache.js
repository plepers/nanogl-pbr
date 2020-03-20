import Program from 'nanogl/program';
import { hashString } from './Hash';
const PRAGMA_SLOT = '#pragma SLOT';
const PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;
function processSlots(source, slots) {
    for (const { code, key } of slots.slots) {
        source = source.replace(PRAGMA_SLOT + ' ' + key, code);
    }
    PRAGMA_REGEX.lastIndex = 0;
    source = source.replace(PRAGMA_REGEX, '');
    return source;
}
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
    compile(source) {
        const hash = hashString(source.shaderSource.uid, source.slots.hash);
        const cached = this._cache[hash];
        if (cached !== undefined) {
            return cached;
        }
        const vert = processSlots(source.shaderSource.vert, source.slots);
        const frag = processSlots(source.shaderSource.frag, source.slots);
        const prg = new Program(this.gl, vert, frag);
        this._cache[hash] = prg;
        return prg;
    }
    release(prg) {
    }
}
;
export default ProgramCache;
