import ChunkCollection from "./ChunkCollection";
import IProgramSource, { ShaderSource } from "./interfaces/IProgramSource";
import { GLContext } from "nanogl/types";
import ProgramCache from "./ProgramCache";
import Program from "nanogl/program";
import ChunksSlots from "./ChunksSlots";

/**
 * This class manages the creation and management of a program
 * from a shader source and a list of chunk collections.
 */
export default class ProgramSource {
  /** The list of chunk collections used to compile the program */
  private _chunkCollections : ChunkCollection[] = [];
  /** The shader source used to compile the program */
  private _shaderSource : ShaderSource;
  /** The program cache */
  private _prgCache : ProgramCache;

  /** The current program */
  _program: Program | null = null
  /** The current revision */
  _revision = 0;

  /**
   * @param {GLContext} gl The webgl context this ProgramSource belongs to
   * @param {ShaderSource} shaderSource The shader source to use
   */
  constructor( gl : GLContext, shaderSource : ShaderSource ){
    this._shaderSource = shaderSource;
    this._prgCache = ProgramCache.getCache( gl );
  }

  /**
   * Add a chunk collection to the list.
   * @param {ChunkCollection} chunkCollection The chunk collection to add
   */
  addChunkCollection( chunkCollection : ChunkCollection ) : void {
    this._chunkCollections.push( chunkCollection );
  }

  /**
   * Get the current revision from the chunk collections.
   */
  getSourceRevision() : number {
    let rev = 0;
    for (const collection of this._chunkCollections) {
      rev += collection.getRevision();
    }
    return rev;
  }

  /**
   * Setup the program for the chunk collections.
   */
  setupProgram() : Program {
    const prg = this.getProgram();
    prg.use();

    for (const collection of this._chunkCollections) {
      collection.setupProgram( prg );
    }
    return prg;
  }

  /**
   * Get the current program.
   * If the program is not up to date, it will be recompiled.
   */
  getProgram( ) : Program {

    const sourceRev = this.getSourceRevision();

    if( this._program === null || this._revision !== sourceRev ){
      this.compile();
      this._revision = sourceRev;
    }
    return this._program!;
  }

  /**
   * Compile the program from the shader source and the chunk collections.
   */
  compile(){
    const pcache = this._prgCache;

    if( this._program !== null ){
      pcache.release( this._program );
    }

    const slots = new ChunksSlots();

    for (const collection of this._chunkCollections) {
      collection.getCode( slots );
    }

    const prgSource : IProgramSource = {
      shaderSource   : this._shaderSource,
      slots          : slots,
    }

    this._program = pcache.compile( prgSource );
  }

}
