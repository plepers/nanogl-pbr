import ChunksSlots from "../ChunksSlots";

export type ShaderSource = {
  vert : string,
  frag : string,
  uid  : string,
}


export default interface IProgramSource {
  shaderSource : ShaderSource;
  slots : ChunksSlots;
}