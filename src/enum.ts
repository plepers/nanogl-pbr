
import Chunk from './chunk'
import ChunkSlots from './chunks-slots'

class Enum<TEnum=any> extends Chunk {
  
  name: string;
  values: (keyof TEnum)[]
  
  private _val: keyof TEnum;


  constructor(name : string, penum : TEnum ) {

    super(true, false);

    this.name = name;


    var keys = Object.keys(penum) as (keyof TEnum)[];
    keys = keys.filter(k => isNaN(parseInt(k.toString())));
    
    this.values = keys;
    this._val = this.values[0]

  }



  set( val : keyof TEnum ) {

    if (this._val !== val) {
      if (val !== null && this.values.indexOf(val) === -1) {
        throw new Error('invalide Enum value :' + val);
      }
      this._val = val;
      this.invalidate();
    }
  }


  genCode(slots : ChunkSlots) {

    // PF
    let c = '';


    for (var i = 0; i < this.values.length; i++) {
      c += '#define ' + this.values[i] + ' ' + (i + 1) + '\n';
    }
    c += '#define VAL_' + this.name + ' ' + this._val + '\n';
    c += '#define ' + this.name + '(k) VAL_' + this.name + ' == k\n';
    slots.add('definitions', c);

  }


  getHash() {
    return this.values.indexOf(this._val) + '/' +
      this.name;
  }

}

export default Enum
