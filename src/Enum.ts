
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'
import hashBuilder, { hashString } from './Hash';


function defReducer( res:string, v:string, i:number ){
    res += `#define ${v} ${i+1}\n`;
    return res;
}



class Enum<T extends readonly string[]> extends Chunk {
  
  name: string;
  values: T;
  
  private _val: T[number];
  private _valIndex: number;

  private _enumDefs: string;
  private _accesDef: string;


  constructor(name : string, penum : T ) {

    super(true, false);

    this.name = name;

    this.values = penum;
    this._valIndex = 0;
    this._val = this.values[0]

    this._enumDefs = this.values.reduce( defReducer, '' );
    this._accesDef = `#define ${this.name}(k) VAL_${this.name} == k`;
  }



  set( val : T[number] ) {
      
    if( this._val === val ){
        return;
    }

    const idx = this.values.indexOf(val);

    if ( idx === -1) {
      throw new Error(`invalide Enum value :${val}`);
    }

    if (this._valIndex !== idx) {
      this._valIndex = idx;
      this._val = val;
      this.invalidateCode();
    }
  }

/**
 * new Enum( 'MyEnum', ['A', 'B', 'C'] )
 * 
 * #define A 1
 * #define B 2
 * #define C 3
 * #define VAL_MyEnum A
 * #define MyEnum(k) VAL_MyEnum == k
 *
 * @param slots 
 */
  _genCode(slots : ChunksSlots) {

    // PF
    const c = [
      this._enumDefs,
      `#define VAL_${this.name} ${this._val}`,
      this._accesDef
    ].join('\n');

    slots.add('definitions', c );

  }


}

export default Enum
