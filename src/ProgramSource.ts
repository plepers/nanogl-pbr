import ChunkCollection from "./ChunkCollection";
import IProgramSource, { ShaderSource } from "./interfaces/IProgramSource";
import { GLContext } from "nanogl/types";
import ProgramCache from "./ProgramCache";
import Program from "nanogl/program";
import ChunksSlots from "./ChunksSlots";


export default class ProgramSource {

  private _chunkCollections : ChunkCollection[] = [];
  private _shaderSource : ShaderSource;
  private _prgCache : ProgramCache;


  _program: Program | null = null
  _revision = 0;


  constructor( gl : GLContext, shaderSource : ShaderSource ){
    this._shaderSource = shaderSource;
    this._prgCache = ProgramCache.getCache( gl );
  }

  addChunkCollection( chunkCollection : ChunkCollection ) : void {
    this._chunkCollections.push( chunkCollection );
  }

  getSourceRevision() : number {
    let rev = 0;
    for (const collection of this._chunkCollections) {
      rev += collection.getRevision();
    }
    return rev;
  }

  setupProgram() : Program {
    const prg = this.getProgram();
    prg.use();

    for (const collection of this._chunkCollections) {
      collection.setupProgram( prg );
    }
    return prg;
  }


  getProgram( ) : Program {
    
    const sourceRev = this.getSourceRevision();

    if( this._program === null || this._revision !== sourceRev ){
      this.compile();
      this._revision = sourceRev;
    }
    return this._program!;
  }


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
