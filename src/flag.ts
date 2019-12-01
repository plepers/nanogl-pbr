
import Chunk from './chunk'
import ChunkSlots from './chunks-slots'


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
    val = !!val;
    if (this._val !== val) {
      this._val = val;
      this.invalidate();
    }
  }


  genCode(slots : ChunkSlots) {
    let c;

    // PF
    c = '#define ' + this.name + ' ' + (~~this._val) + '\n';
    slots.add('definitions', c);

  }


  getHash() {
    return this.name + '-' +
      (~~this._val);
  }

}

export default Flag