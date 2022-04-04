import Chunk from "../Chunk";
import ChunksSlots from "../ChunksSlots";
import { GlslCode } from '../interfaces/GlslCode'
import Vert from "../glsl/templates/standard/ibl-sh9-v.vert"
import Frag from "../glsl/templates/standard/ibl-sh9.frag"

export default class SH9 extends Chunk {

  constructor( ) {

    super(true, false);

  }

  _genCode(slots: ChunksSlots) {

    slots.add('pv', Vert(this) );
    slots.add('pf', Frag(this) );

  }

}