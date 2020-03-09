
type Slot = {
  key: string;
  code: string;
}

class ChunkSlots {

  slots: Slot[];
  slotsMap: Record<string, Slot>;
  hash: string;


  constructor() {
    this.slots    = [];
    this.slotsMap = {};
    this.hash     = '';
  }



  getSlot(id: string) {
    var s: Slot = this.slotsMap[id];
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
    this.hash += other.hash;
    for( var os of other.slots ){
      this.add( os.key, os.code );
    }
  }

};


export default ChunkSlots