import GLConfig       from 'nanogl-state/GLConfig'
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramSource from './ProgramSource';




/**
 * This class manages the creation and management of a program
 * for a material pass.
 *
 * The program is created from the shader source of the pass,
 * the inputs from both the material and the pass.
 */
export class PassInstance {
  /** The material pass */
  readonly pass : MaterialPass;
  /** The material this pass instance belongs to */
  readonly material: Material;
  /**
   * The program source managing the program
   * computed from the pass shader source
   */
  readonly programSource : ProgramSource

  /** @hidden */
  _program: Program | null = null

  /**
   * @param {Material} material The material this pass instance belongs to
   * @param {MaterialPass} pass The material pass to manage
   */
  constructor( material : Material, pass : MaterialPass ){
    this.programSource = new ProgramSource(material.gl, pass._shaderSource );
    this.programSource.addChunkCollection( material.inputs)
    this.programSource.addChunkCollection( pass.inputs)

    this.pass = pass;
    this.material = material;
  }

  /**
   * Prepare the program for the material pass.
   * @param {Node} node The node to use for transforms
   * @param {Camera} camera The camera to use for projection
   */
  prepare( node : Node, camera : Camera ) : Program {
    const prg = this.programSource.setupProgram();
    this.pass.prepare( prg, node, camera );
    return prg;
  }

  /**
   * Get the program for the material pass instance.
   */
  getProgram( ) : Program {
    return this.programSource.getProgram();
  }


}



/**
 * This class manages materials.
 */
export default class Material {
  /** The render mask of the material */
  mask: number = ~0;

  /** The glconfig of the material */
  readonly glconfig = new GLConfig();
  /** The collection of shader chunks */
  readonly inputs   = new ChunkCollection();

  /** The map of material pass instances to their id */
  _passMap = new Map<MaterialPassId, PassInstance>();
  /** The list of material pass instances */
  _passes  : PassInstance[] = [];

  /**
   * @param {GLContext} gl The webgl context this Material belongs to
   * @param {string} [name] The name of the material
   */
  constructor( readonly gl : GLContext, public name: string = '') {
  }

  /**
   * Add a pass to the material.
   * @param pass The material pass to add
   * @param id The id of the pass to add
   */
  addPass( pass:MaterialPass, id:MaterialPassId = 'color' ) : PassInstance {
    if( this._passMap.has( id ) ){
      this.removePass( id );
    }
    const pInst = new PassInstance( this, pass );
    this._passMap.set( id, pInst );
    this._passes.push( pInst );
    return pInst;
  }

  /**
   * Remove a pass from the material.
   * @param id The id of the pass to remove
   */
  removePass( id : MaterialPassId ){
    //TODO: release program?
    if( this._passMap.has( id ) ){
      const p = this.getPass( id )!;
      this._passes.splice( this._passes.indexOf( p ), 1 );
      this._passMap.delete( id );
    }
  }

  /**
   * Get a pass with its id.
   * @param id The id of the pass to get
   */
  getPass( id:MaterialPassId = 'color' ) : PassInstance | undefined{
    return this._passMap.get( id );
  }

  /**
   * Know whether the material has a pass with the given id or not.
   * @param id The id of the pass to check
   */
  hasPass( id:MaterialPassId ):boolean{
    return this._passMap.has( id );
  }

  /**
   * Get all the passes of the material.
   */
  getAllPasses():PassInstance[]{
    return this._passes;
  }

  /**
   * Get the program for a pass with the pass id, if it exists.
   * @param passId The id of the pass to get the program from
   */
  getProgram( passId : MaterialPassId ) : Program | undefined {
    const pass = this.getPass( passId );
    return pass?.getProgram();
  }

}