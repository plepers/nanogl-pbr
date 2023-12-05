import Program from "nanogl/program";
import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";

import { mat4 } from "gl-matrix";
import SkinCode, { JOINTS_UNIFORM } from "./SkinCode";

/**
 * The definition of a skin attribute.
 * @example
 * ```js
 * {
 *    weightsAttrib:  'aSkinWeights'
 *    jointsAttrib : 'aSkinJoints'
 *    numComponents : 3
 * }
 * ```
 */
export type SkinAttributeSet = {
  /** The name of the attribute for weights data */
  weightsAttrib : string;
  /** The name of the attribute for joints data */
  jointsAttrib  : string;
  /** The size of the attribute (`1` for float, `2` for vec2, etc.) */
  numComponents : 1|2|3|4;
}

/**
 * This class manages the code generation for skin deformers in a shader chunk.
 * It is used to deform a geometry using skinning.
 *
 * You can change the joint matrices using the `jointMatrices` property.
 *
 * @extends {Chunk}
 */
export default class SkinDeformer extends Chunk {
  /** The list of skin attribute definitions */
  _attributeSets : SkinAttributeSet[];
  /** The number of joints */
  _numJoints : number;

  /** The joints matrices data buffer */
  private _jointsBuffer   : Float32Array;
  /** The joint matrices list */
  private _jointMatrices : mat4[];

  /**
   * @param {number} numJoints The number of joints
   * @param {SkinAttributeSet[]} sets The list of skin attribute definitions
   */
  constructor( numJoints : number, sets : SkinAttributeSet[] ){
    super( true, true );

    this._attributeSets = sets;
    this._numJoints = numJoints;

    this._jointsBuffer = new Float32Array(this._numJoints * 16 );
    this._jointMatrices = [];
    const buff = this._jointsBuffer.buffer;
    for (let index = 0; index < this._numJoints; index++) {
      this._jointMatrices.push( <mat4>new Float32Array(buff, index*16*4, 16));
    }
  }

  /**
   * Get the number of joints.
   */
  get numJoints(){
    return this._numJoints;
  }

  /**
   * Get the joint matrices.
   */
  get jointMatrices(){
    return this._jointMatrices;
  }

  /**
   * Setup the given program for this skin deformer.
   * @param prg The program to setup
   */
  setup(prg: Program): void{
    prg[JOINTS_UNIFORM]( this._jointsBuffer )
  }

  /**
   * Generate the vertex shader code for this skin deformer.
   * @param slots The slots to add the code to
   */
  protected _genCode(slots: ChunksSlots ): void {
    slots.add('pv'         , SkinCode.preVertexCode(this));
    slots.add('vertex_warp', SkinCode.vertexCode());
  }


}