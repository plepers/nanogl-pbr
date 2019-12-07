import Program from './program'
import { GLContext } from 'nanogl/types'
import GLConfig from 'nanogl-state/config'
import ChunkSlots from './chunks-slots'
import IMaterial from './interfaces/material';

const PRAGMA_SLOT = '#pragma SLOT';
const PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;



class ProgramCache {

  gl: GLContext;
  
  private _cache: Record<string,Program>;

  constructor(gl: GLContext) {
    this.gl = gl;
    this._cache = {};
  }


  static getCache(gl: GLContext) : ProgramCache {
    const agl = gl as any;
    if (agl._prgcache === undefined) {
      agl._prgcache = new ProgramCache(gl);
    }
    return agl._prgcache;
  }


  compile(material : IMaterial) : Program {

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

  // called by materials when prg is not used anymore
  release( prg : Program ) {
    // TODO: implement PrgCache.release
  }


  _addProgram( prg : Program, hash : string ) {
    this._cache[hash] = prg;
  }


  processSlots( code : string, slots : ChunkSlots ) : string {

    for (var i = 0; i < slots.slots.length; i++) {
      var scode = slots.slots[i].code;
      var key = slots.slots[i].key;
      code = code.replace(PRAGMA_SLOT + ' ' + key, scode);
    }

    // cleanup unmatched slots
    PRAGMA_REGEX.lastIndex = 0;
    code = code.replace(PRAGMA_REGEX, '');

    return code;
  }

};




export default ProgramCache