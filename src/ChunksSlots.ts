import { Hash, mergeHash } from "./Hash";

export type ChunkSlot = {
  key: string;
  code: string;
}

type HashedChunkSlot = ChunkSlot & {
  hash: Hash;
}

export default class ChunkSlots {

  slots: ChunkSlot[];
  slotsMap: Record<string, ChunkSlot>;
  hash: Hash = 0;


  constructor() {
    this.slots    = [];
    this.slotsMap = {};
  }



  getSlot(id: string) {
    var s: ChunkSlot = this.slotsMap[id];
    if (s === undefined) {
      s = {
        key: id,
        code: ''
      };
      this.slotsMap[id] = s;
      this.slots.push(s);
    }
    return s;
  }


  add(slotId: string, code: string) {
    this.getSlot(slotId).code += code + '\n';
  }
  

  merge( other : ChunkSlots ){
    this.hash = mergeHash( this.hash, other.hash );
    for( var slot of other.slots ){
      this.add( slot.key, slot.code );
    }
  }

};

