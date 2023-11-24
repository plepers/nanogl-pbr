import ChunksSlots from "../ChunksSlots";

/** A source for a shader. */
export type ShaderSource = {
  /** The vertex shader code */
  vert : string,
  /** The fragment shader code */
  frag : string,
  /** The unique id of the shader */
  uid  : string,
}

/**
 * This interface represents a source for a shader program.
 */
export default interface IProgramSource {
  /** The source of the shader */
  shaderSource : ShaderSource;
  /** The slots for the shader chunks */
  slots : ChunksSlots;
}