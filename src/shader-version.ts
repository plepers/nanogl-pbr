
import Chunk from './chunk'
import ChunkSlots from './chunks-slots'

type GlslVersion = '100' | '300 es'


class ShaderVersion extends Chunk {

  version: GlslVersion;

  constructor( v : GlslVersion = '100' ) {
    super(true, false);
    this.version = v;
  }


  set( v : GlslVersion ) {
    this.version = v;
    this.invalidate();
  }


  getHash() {
    return 'v' + this.version;
  }


  genCode( slots : ChunkSlots ) {
    var s = `#version ${this.version}\n`;
    slots.add('version', s);
  }

}

export default ShaderVersion
