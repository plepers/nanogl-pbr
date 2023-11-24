
import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'
import { GLContext, isWebgl2 } from "nanogl/types";

/** GLSL version. */
export type GlslVersion = '100' | '300 es'

/**
 * This class manages the glsl version definition
 * in a shader chunk.
 *
 * @extends {Chunk}
 */
class ShaderVersion extends Chunk {
  /** The current glsl version */
  private version: GlslVersion;

  /**
   * @param {GlslVersion} v The initial glsl version
   */
  constructor( v : GlslVersion = '100' ) {
    super(true, false);
    this.version = v;
  }

  /**
   * Set the glsl version.
   *
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   *
   * @param {GlslVersion} v The new glsl version
   */
  set( v : GlslVersion ) {
    if( this.version !== v ){
      this.version = v;
      this.invalidateCode();
    }
  }

  /**
   * Get the current glsl version.
   */
  get() : GlslVersion{
    return this.version;
  }

  /**
   * Generate the shader code for this ShaderVersion.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   *
   * @example
   * For an ShaderVersion defined as :
   * ```ts
   * new ShaderVersion('300 es')
   * ```
   *
   * The generated code will be :
   * ```glsl
   * #version 300 es
   * ```
   */
  _genCode( slots : ChunksSlots ) {
    var s = `#version ${this.version}`;
    slots.add('version', s);
  }

  /**
   * Guess the glsl version from the webgl context,
   * and set it.
   * @param {GLContext} gl The webgl context
   */
  guessFromContext( gl:GLContext ){
    this.set( isWebgl2(gl) ? '300 es' : '100' );
  }

}

export default ShaderVersion
