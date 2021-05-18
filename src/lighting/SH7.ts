import Chunk from "../Chunk";
import ChunksSlots from "../ChunksSlots";
import Vert from "../glsl/templates/standard/ibl-sh7.vert"
import Frag from "../glsl/templates/standard/ibl-sh7.frag"

export default class SH7 extends Chunk {

  constructor( ) {
    super(true, false);
  }

  _genCode(slots: ChunksSlots) {

    slots.add('pv', Vert(this) );
    slots.add('pf', Frag(this) );

  }

}