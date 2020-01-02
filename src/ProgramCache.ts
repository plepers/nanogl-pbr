import Program from 'nanogl/program'
import { GLContext } from 'nanogl/types'
import GLConfig from 'nanogl-state/config'
import ChunkSlots from './ChunksSlots'
import IMaterial from './interfaces/IMaterial';
import IProgramSource from './ProgramSource';

const PRAGMA_SLOT = '#pragma SLOT';
const PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;


function processSlots( source : string, slots : ChunkSlots ) : string {

  for (const {code, key} of slots.slots) {
      source = source.replace(PRAGMA_SLOT + ' ' + key, code);
  }

  // cleanup unmatched slots
  PRAGMA_REGEX.lastIndex = 0;
  source = source.replace(PRAGMA_REGEX, '');

  return source;
}



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


  compile(source : IProgramSource) : Program {

    const hash = source.slots.hash;

    const cached = this._cache[hash];
    if (cached !== undefined) {
      return cached;
    }

    const vert = processSlots( source.vertexSource  , source.slots );
    const frag = processSlots( source.fragmentSource, source.slots );

    const prg = new Program(this.gl, vert, frag);

    this._cache[hash] = prg;

    return prg;

  }


  // called by materials when prg is not used anymore
  release( prg : Program ) {
    // TODO: implement PrgCache.release
  }



  
};




export default ProgramCache