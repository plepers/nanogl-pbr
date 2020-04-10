
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'


class Flag<T extends string = string> extends Chunk {
  
  name: T;

  private _val: boolean;
  
  constructor(name : T, val : boolean = false ) {

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
      this.invalidateCode();
    }
  }


  _genCode(slots : ChunksSlots) {
    
    const c = `#define ${this.name} ${~~this._val}`;
    slots.add('definitions', c);

  }

}

export default Flag
