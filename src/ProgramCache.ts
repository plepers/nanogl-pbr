import Program from 'nanogl/program'
import { GLContext } from 'nanogl/types'
import ChunksSlots from './ChunksSlots'
import IProgramSource from './interfaces/IProgramSource';
import { hashString } from './Hash';

const PRAGMA_SLOT = '#pragma SLOT';
const PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;

function _slotRegex(token : string) : RegExp{
  return new RegExp( `${PRAGMA_SLOT}\\s+${token}\\s+`, 'g' )
}

function processSlots( source : string, slots : ChunksSlots ) : string {

  for (const {code, key} of slots.slots) {
    source = source.replace(_slotRegex(key), code);
  }

  // cleanup unmatched slots
  PRAGMA_REGEX.lastIndex = 0;
  source = source.replace(PRAGMA_REGEX, '');

  return source;
}


/**
 * This class manages the cache of shader programs.
 *
 * It allows to compile programs from a program source
 * and cache them to avoid recompiling them if they haven't changed.
 */
class ProgramCache {
  /** The webgl context this ProgramCache belongs to */
  gl: GLContext;

  /** The list of hash/program pairs used to keep track of cached programs */
  private _cache: Record<string,Program>;

  /**
   * @param {GLContext} gl The webgl context this ProgramCache belongs to
   */
  constructor(gl: GLContext) {
    this.gl = gl;
    this._cache = {};
  }

  /**
   * Create a ProgramCache instance or return the existing one for given webgl context.
   * @param gl The webgl context
   */
  static getCache(gl: GLContext) : ProgramCache {
    const agl = gl as any;
    if (agl._prgcache === undefined) {
      agl._prgcache = new ProgramCache(gl);
    }
    return agl._prgcache;
  }

  /**
   * Compile a program from a program source.
   * If the program source has already been compiled and has not changed,
   * the cached program is returned.
   *
   * @param {IProgramSource} source The program source to use
   */
  compile(source : IProgramSource) : Program {

    const hash = hashString( source.shaderSource.uid, source.slots.getHash() );

    const cached = this._cache[hash];
    if (cached !== undefined) {
      return cached;
    }

    const vert = processSlots( source.shaderSource.vert, source.slots );
    const frag = processSlots( source.shaderSource.frag, source.slots );

    const prg = new Program(this.gl, vert, frag);

    this._cache[hash] = prg;

    return prg;

  }


  /**
   * Release the given program.
   * @param prg The program to release
   */
  release( prg : Program ) {
    // TODO: implement PrgCache.release
  }




};




export default ProgramCache