import Chunk from "../../Chunk";
import { DirtyFlag } from "../../ChunkCollection";
import { hashString } from "../../Hash";


export class CodeChunk extends Chunk {

  constructor(code, slot = 'v') {
    super(true, false)
    this.code = code;
    this.slot = slot;
  }
  
  _genCode( slots ){
    slots.add( this.slot, this.code );
  }
  
  _getHash() {
    return hashString(`-${this.code}-`);
  }
  
  setCode( code ){
    this.code = code;
    this.invalidateCode();
  }
}