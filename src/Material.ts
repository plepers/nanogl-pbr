import GLConfig       from 'nanogl-state/GLConfig'
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramSource from './ProgramSource';





export class PassInstance {

  readonly pass : MaterialPass;
  readonly material: Material;
  readonly programSource : ProgramSource

  _program: Program | null = null

  constructor( material : Material, pass : MaterialPass ){
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




export default class Material {
  
  mask: number = ~0;
  
  readonly glconfig = new GLConfig();
  readonly inputs   = new ChunkCollection();
  

  _passMap = new Map<MaterialPassId, PassInstance>();
  _passes  : PassInstance[] = [];

  
  constructor( readonly gl : GLContext, public name: string = '') {
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

  getPass( id:MaterialPassId = 'color' ) : PassInstance | undefined{
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