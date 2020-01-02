import GLConfig       from 'nanogl-state/config'
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import IProgramSource from './ProgramSource';


export default abstract class BaseMaterial {
  
  name: string;

  
  mask: number = ~0;
  
  glconfig : GLConfig;
  inputs: ChunkCollection;
  
  _program: Program | null
  _prgcache: ProgramCache;

  abstract _vertSrc : string;
  abstract _fragSrc : string;
  
  _passMap : Map<string, BaseMaterial>;
  _passes  : BaseMaterial[];
  
  
  constructor(gl : GLContext, name: string = '') {
    this.name = name;
    
    this.glconfig = new GLConfig();
    
    this.inputs   = new ChunkCollection( this.getMatId() );
    
    this._program =null;
    this._prgcache  = ProgramCache.getCache( gl );
    
    this._passMap = new Map()
    this._passes  = []
    
  }


  abstract getMatId() : string;


  addPass( id:string, pass:BaseMaterial ){
    if( this._passMap.has( id ) ){
      this.removePass( id );
    }
    this._passMap.set( id, pass );
    this._passes.push( pass );
  }

  removePass( id : string ){
    if( this._passMap.has( id ) ){
      const p = this.getPass( id )!;
      this._passes.splice( this._passes.indexOf( p ), 1 );
      this._passMap.delete( id );
    }
  }

  getPass( id:string ):BaseMaterial|undefined{
    return this._passMap.get( id );
  }
  
  hasPass( id:string ):boolean{
    return this._passMap.has( id );
  }

  getAllPasses():BaseMaterial[]{
    return this._passes;
  }



  getProgram() : Program {
    if( this._program === null || this.inputs.isInvalid() ){
      this.compile();
    }
    return this._program!;
  }


  compile(){
    
    if( this._program !== null ){
      this._prgcache.release( this._program );
    }

    // this.inputs.updateChunks();

    const prgSource : IProgramSource = {
      vertexSource   : this._vertSrc,
      fragmentSource : this._fragSrc,
      slots          : this.inputs.getCode(),
    }

    this._program = this._prgcache.compile( prgSource );
  }


}