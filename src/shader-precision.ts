
import Chunk from './chunk'
import ChunkSlots from './chunks-slots'

import {GlslPrecision} from './interfaces/precision'


/**
manage float precision qualifier only
**/
class ShaderPrecision extends Chunk {

  private fprecision: GlslPrecision;

  constructor( p : GlslPrecision = 'mediump' ) {

    super(true, false);

    this.fprecision = p;
  }




  set(p:GlslPrecision) {
    this.fprecision = p;
  }


  getHash() {
    return 'p' + this.fprecision;
  }


  genCode( slots  :ChunkSlots ) {
    const s = `precision ${this.fprecision} float;\n`;
    slots.add('precision', s);
  }

}

export default ShaderPrecision
