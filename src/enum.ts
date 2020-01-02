
import Chunk from './Chunk'
import ChunkSlots from './ChunksSlots'
import { DirtyFlag } from './ChunkCollection';

class Enum<T extends readonly string[]> extends Chunk {
  
  name: string;
  values: T;
  
  private _val: T[number];


  constructor(name : string, penum : T ) {

    super(true, false);

    this.name = name;

    this.values = penum;
    this._val = this.values[0]

  }



  set( val : T[number] ) {

    if (this._val !== val) {
      if (val !== null && this.values.indexOf(val) === -1) {
        throw new Error(`invalide Enum value :${val}`);
      }
      this._val = val;
      this.invalidate(DirtyFlag.Code);
    }
  }


  _genCode(slots : ChunkSlots) {

    // PF
    let c = '';

    for (var i = 0; i < this.values.length; i++) {
      c += `#define ${this.values[i]} ${i}${1}\n`;
    }
    c += `#define VAL_${this.name} ${this._val}\n`;
    c += `#define ${this.name}(k) VAL_${this.name} == k\n`;
    slots.add('definitions', c);

  }


  _getHash() {
    return `${this.values.indexOf(this._val)}/${this.name}`;
  }

}

export default Enum
