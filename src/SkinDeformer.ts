import Program from "nanogl/program";
import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";

import { mat4 } from "gl-matrix";
import SkinCode, { JOINTS_UNIFORM } from "./SkinCode";

export type SkinAttributeSet = {
  weightsAttrib : string;
  jointsAttrib  : string;
  numComponents : 1|2|3|4;
}

export default class SkinDeformer extends Chunk {

  _attributeSets : SkinAttributeSet[];
  _numJoints : number;

 
  private _jointsBuffer   : Float32Array;
  private _jointMatrices : mat4[];

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


  get numJoints(){
    return this._numJoints;
  }

  get jointMatrices(){
    return this._jointMatrices;
  }


  setup(prg: Program): void{
    prg[JOINTS_UNIFORM]( this._jointsBuffer )
  }


  protected _genCode(slots: ChunksSlots ): void {
    slots.add('pv'         , SkinCode.preVertexCode(this));
    slots.add('vertex_warp', SkinCode.vertexCode());
  }

  
}