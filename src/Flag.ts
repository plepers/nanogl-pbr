
import Chunk from './Chunk'
import ChunkSlots from './ChunksSlots'
import { DirtyFlag } from './ChunkCollection';


class Flag extends Chunk {
  
  name: string;

  private _val: boolean;
  
  constructor(name : string, val : boolean = false ) {

    super(true, false);

    this.name = name;
    this._val = !!val;
  }



  enable() {
    this.set(true);
  }


  disable() {
    this.set(false);
  }


  set(val : boolean = false) {
    if (this._val !== val) {
      this._val = val;
      this.invalidate(DirtyFlag.Code);
    }
  }


  _genCode(slots : ChunkSlots) {
    // PF
    const c = `#define ${this.name} ${~~this._val}\n`;
    slots.add('definitions', c); 

  }


  _getHash() {
    return `${this.name}-${~~this._val}`;
  }

}

export default Flag
