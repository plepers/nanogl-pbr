import GLConfig       from 'nanogl-state/config'
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import IProgramSource, {ShaderSource} from './interfaces/IProgramSource';
import ChunkSlots from './ChunksSlots';
import MaterialPass from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';





class PassInstance {

  readonly id: string;
  readonly pass : MaterialPass;
  readonly material: BaseMaterial;

  _program: Program | null = null
  _revision = 0;

  constructor( material : BaseMaterial, id:string, pass : MaterialPass ){
    this.id = id;
    this.pass = pass;
    this.material = material;
  }

  
  getSourceRevision(){
    return this.pass.inputs.getRevision() + this.material.inputs.getRevision();
  }


  prepare( node : Node, camera : Camera ){
    const prg = this.getProgram();

    prg.use();

    this.pass    .inputs.setupProgram( prg );
    this.material.inputs.setupProgram( prg );

    this.pass.prepare( prg, node, camera );
  }


  getProgram( ) : Program {
    
    const sourceRev = this.getSourceRevision();

    if( this._program === null || this._revision !== sourceRev ){
      this.compile();
      this._revision = sourceRev;
    }
    return this._program!;
  }


  private compile(){
    const pcache = this.material._prgcache;

    if( this._program !== null ){
      pcache.release( this._program );
    }

    const slots = new ChunkSlots();
    this.pass     .inputs.getCode( slots );
    this.material .inputs.getCode( slots );
    
    const prgSource : IProgramSource = {
      shaderSource   : this.pass._shaderSource,
      slots          : slots,
    }
    
    this._program = pcache.compile( prgSource );
  }

}




export default class BaseMaterial {
  
  name: string;
  
  mask: number = ~0;
  
  glconfig : GLConfig;
  
  inputs: ChunkCollection;
  
  _prgcache: ProgramCache;

  _passMap : Map<string, PassInstance>;
  _passes  : PassInstance[];

  
  constructor(gl : GLContext, name: string = '') {
    
    this.name = name;
    
    this.glconfig = new GLConfig();
    
    this.inputs   = new ChunkCollection();
    
    this._prgcache  = ProgramCache.getCache( gl );
    
    this._passMap = new Map()
    this._passes  = []

  }


  addPass( id:string, pass:MaterialPass ) : PassInstance {
    if( this._passMap.has( id ) ){
      this.removePass( id );
    }
    const pInst = new PassInstance( this, id, pass );
    this._passMap.set( id, pInst );
    this._passes.push( pInst );
    return pInst;
  }


  removePass( id : string ){
    //TODO: release program?
    if( this._passMap.has( id ) ){
      const p = this.getPass( id )!;
      this._passes.splice( this._passes.indexOf( p ), 1 );
      this._passMap.delete( id );
    }
  }

  getPass( id:string ) : PassInstance | undefined{
    return this._passMap.get( id );
  }
  
  hasPass( id:string ):boolean{
    return this._passMap.has( id );
  }

  getAllPasses():PassInstance[]{
    return this._passes;
  }

  getProgram( passId : string ) : Program | undefined {
    const pass = this.getPass( passId );
    return pass?.getProgram();
  }

}