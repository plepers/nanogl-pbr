import GLConfig       from 'nanogl-state/config'
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramSource from './ProgramSource';





export class PassInstance {

  readonly pass : MaterialPass;
  readonly material: BaseMaterial;
  readonly programSource : ProgramSource

  _program: Program | null = null

  constructor( material : BaseMaterial, pass : MaterialPass ){
    this.programSource = new ProgramSource(material.gl, pass._shaderSource );
    this.programSource.addChunkCollection( material.inputs)
    this.programSource.addChunkCollection( pass.inputs)

    this.pass = pass;
    this.material = material;
  }


  prepare( node : Node, camera : Camera ) : Program {
    const prg = this.programSource.setupProgram();
    this.pass.prepare( prg, node, camera );
    return prg;
  }


  getProgram( ) : Program {
    return this.programSource.getProgram();
  }


}




export default class BaseMaterial {
  
  name: string;
  
  mask: number = ~0;
  
  glconfig : GLConfig;
  
  inputs: ChunkCollection;
  

  _passMap : Map<MaterialPassId, PassInstance>;
  _passes  : PassInstance[];
  gl: GLContext;

  
  constructor(gl : GLContext, name: string = '') {

    this.gl = gl;
    
    this.name = name;
    
    this.glconfig = new GLConfig();
    
    this.inputs   = new ChunkCollection();
    
    this._passMap = new Map()
    this._passes  = []

  }


  addPass( pass:MaterialPass, id:MaterialPassId = 'color' ) : PassInstance {
    if( this._passMap.has( id ) ){
      this.removePass( id );
    }
    const pInst = new PassInstance( this, pass );
    this._passMap.set( id, pInst );
    this._passes.push( pInst );
    return pInst;
  }


  removePass( id : MaterialPassId ){
    //TODO: release program?
    if( this._passMap.has( id ) ){
      const p = this.getPass( id )!;
      this._passes.splice( this._passes.indexOf( p ), 1 );
      this._passMap.delete( id );
    }
  }

  getPass( id:MaterialPassId ) : PassInstance | undefined{
    return this._passMap.get( id );
  }
  
  hasPass( id:MaterialPassId ):boolean{
    return this._passMap.has( id );
  }

  getAllPasses():PassInstance[]{
    return this._passes;
  }

  getProgram( passId : MaterialPassId ) : Program | undefined {
    const pass = this.getPass( passId );
    return pass?.getProgram();
  }

}