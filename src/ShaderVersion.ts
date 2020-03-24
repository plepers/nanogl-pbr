
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'
import { hashString } from './Hash';

type GlslVersion = '100' | '300 es'


class ShaderVersion extends Chunk {

  private version: GlslVersion;

  constructor( v : GlslVersion = '100' ) {
    super(true, false);
    this.version = v;
  }


  set( v : GlslVersion ) {
    if( this.version !== v ){
      this.version = v;
      this.invalidateCode();
    }
  }

  get() : GlslVersion{
    return this.version;
  }


  _genCode( slots : ChunksSlots ) {
    var s = `#version ${this.version}`;
    slots.add('version', s);
  }

}

export default ShaderVersion
