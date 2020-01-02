import ChunkSlots from "../ChunksSlots";
export declare type ShaderSource = {
    vert: string;
    frag: string;
    uid: string;
};
export default interface IProgramSource {
    shaderSource: ShaderSource;
    slots: ChunkSlots;
}
