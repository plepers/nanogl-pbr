
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'

import {GlslPrecision} from './interfaces/GlslPrecision'


/**
 * This class manages the float precision definition
 * in a shader chunk.
 *
 * @extends {Chunk}
 */
class ShaderPrecision extends Chunk {
  /** The current float precision */
  private fprecision: GlslPrecision;

  /**
   * @param {GlslPrecision} p The initial float precision
   */
  constructor( p : GlslPrecision = 'mediump' ) {

    super(true, false);

    this.fprecision = p;
  }



  /**
   * Set the float precision.
   * @param {GlslPrecision} p The new float precision
   */
  set(p:GlslPrecision) {
    this.fprecision = p;
  }

  /**
   * Generate the shader code for this ShaderPrecision.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   *
   * @example
   * For an ShaderPrecision defined as :
   * ```ts
   * new ShaderPrecision('highp')
   * ```
   *
   * The generated code will be :
   * ```glsl
   * precision highp float;
   * ```
   */
  _genCode( slots  :ChunksSlots ) {
    const s = `precision ${this.fprecision} float;\n`;
    slots.add('precision', s);
  }

}

export default ShaderPrecision
