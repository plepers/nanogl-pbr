import Chunk from "../../Chunk";
import { DirtyFlag } from "../../ChunkCollection";


export class CodeChunk extends Chunk {

  constructor(code, slot = 'v') {
    super(true, false)
    this.code = code;
    this.slot = slot;
  }
  
  _genCode( slots ){
    slots.add( this.slot, this.code );
  }
  
  _getHash(){
    return `-${this.code}-`;
  }
  
  setCode( code ){
    this.code = code;
    this.invalidate( DirtyFlag.Code );
  }
}