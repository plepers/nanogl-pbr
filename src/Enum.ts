
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'


function defReducer( res:string, v:string, i:number ){
    res += `#define ${v} ${i+1}\n`;
    return res;
}


/**
 * This class manages the definition of a constant in a shader chunk,
 * that can only take from a list of values.
 *
 * @typeParam T The type of the list of values
 *
 * @extends {Chunk}
 */
class Enum<T extends readonly string[]> extends Chunk {
  /** The name of the Enum */
  name: string;
  /** The list of values available */
  values: T;

  /** The current value */
  private _val: T[number];
  /** The index in the list of the current value */
  private _valIndex: number;

  /** The shader code that defines the available values */
  private _enumDefs: string;
  /**
   * The shader code that defines the accessor function :
   * returns wether the current value is equal to the given value or not
   */
  private _accesDef: string;

  /**
   * @typeParam T The type of the list of values
   * @param {string} name The name of the Enum
   * @param {T} penum The list of values available
   */
  constructor(name : string, penum : T ) {

    super(true, false);

    this.name = name;

    this.values = penum;
    this._valIndex = 0;
    this._val = this.values[0]

    this._enumDefs = this.values.reduce( defReducer, '' );
    this._accesDef = `#define ${this.name}(k) VAL_${this.name} == k`;
  }

  /**
   * Get the current value.
   */
  value() : T[number] {
    return this._val;
  }

  /**
   * Set the current value.
   *
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   *
   * @param {T[number]} val The new value
   */
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
   * Generate the shader code for this Enum.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   *
   * @example
   * For an Enum defined as :
   * ```js
   * new Enum('MyEnum', ['A', 'B', 'C'])
   * ```
   *
   * The generated code will be :
   * ```glsl
   * #define A 1
   * #define B 2
   * #define C 3
   * #define VAL_MyEnum A
   * #define MyEnum(k) VAL_MyEnum == k
   * ```
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
