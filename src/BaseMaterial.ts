import GLConfig       from 'nanogl-state/config'
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import IProgramSource, {ShaderSource} from './interfaces/IProgramSource';



class MaterialPass {

  
  name: string = '';
  mask: number = ~0;
  
  glconfig? : GLConfig;

  inputs: ChunkCollection = new ChunkCollection();
  _shaderSource: ShaderSource;
  
  
  constructor( shaderSource : ShaderSource ){
    this._shaderSource = shaderSource;
  }

}



class MaterialVariant {

  inputs: ChunkCollection = new ChunkCollection();
  _program: Program | null = null
  _revision = 0;

}

export default abstract class BaseMaterial {
  
  name: string;

  
  mask: number = ~0;
  
  glconfig : GLConfig;
  inputs: ChunkCollection;
  
  _program: Program | null
  _prgcache: ProgramCache;

  _passMap : Map<string, MaterialPass>;
  _passes  : MaterialPass[];

  // _defaultVariant = new MaterialVariant();
  
  
  constructor(gl : GLContext, name: string = '') {
    this.name = name;
    
    this.glconfig = new GLConfig();
    
    this.inputs   = new ChunkCollection();
    
    this._program =null;
    this._prgcache  = ProgramCache.getCache( gl );
    
    this._passMap = new Map()
    this._passes  = []
    
  }


  abstract getShaderSource() : ShaderSource;


  addPass( id:string, pass:MaterialPass ){
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

  getPass( id:string ):MaterialPass|undefined{
    return this._passMap.get( id );
  }
  
  hasPass( id:string ):boolean{
    return this._passMap.has( id );
  }

  getAllPasses():MaterialPass[]{
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
    
    const prgSource : IProgramSource = {
      shaderSource   : this.getShaderSource(),
      slots          : this.inputs.getCode(),
    }
    
    this._program = this._prgcache.compile( prgSource );
  }
  
  // variants
  // ========

  __getProgram( pass : string, variant : MaterialVariant ) : Program {
    
    const invalidVariant = variant._revision !== (this.inputs.getRevision() + variant.inputs.getRevision());

    if( variant._program === null || invalidVariant ){
      this.__compile( pass, variant );
    }
    return variant._program!;
  }

  __compile( pass:string, variant : MaterialVariant ){
    
    if( variant._program !== null ){
      this._prgcache.release( variant._program );
    }
    
    const prgSource : IProgramSource = {
      shaderSource   : this.getShaderSource(),
      slots          : this.inputs.getCode(),
    }
    
    this._program = this._prgcache.compile( prgSource );
  }
  

}