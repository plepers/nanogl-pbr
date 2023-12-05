
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'

/**
 * This class manages the definition of a constant in a shader chunk,
 * with a boolean value.
 *
 * @typeParam T The name of the flag
 *
 * @extends {Chunk}
 */
class Flag<T extends string = string> extends Chunk {
  /** The name of the flag */
  name: T;

  /** The current value */
  private _val: boolean;

  /**
   * @typeParam T The name of the flag
   * @param {T} name The name of the flag
   * @param {boolean} [val=false] The initial value
   */
  constructor(name : T, val : boolean = false ) {

    super(true, false);

    this.name = name;
    this._val = !!val;
  }

  /**
   * Enable the flag.
   * This sets the value to true.
   */
  enable() {
    this.set(true);
  }

  /**
   * Disable the flag.
   * This sets the value to false.
   */
  disable() {
    this.set(false);
  }

  /**
   * Set the current value.
   *
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   *
   * @param {boolean} [val=false] The new value
   */
  set(val : boolean = false) {
    if (this._val !== val) {
      this._val = val;
      this.invalidateCode();
    }
  }

  /**
   * Get the current value.
   */
  get value(): boolean{
    return this._val
  }

  /**
   * Generate the shader code for this Flag.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   *
   * @example
   * For a Flag defined as :
   * ```js
   * new Flag('MyFlag', true)
   * ```
   *
   * The generated code will be :
   * ```glsl
   * #define MyFlag 1
   * ```
   */
  _genCode(slots : ChunksSlots) {

    const c = `#define ${this.name} ${~~this._val}`;
    slots.add('definitions', c);

  }

}

export default Flag
