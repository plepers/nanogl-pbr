import ChunkSlots from "./ChunksSlots";
export default interface IProgramSource {
    vertexSource: string;
    fragmentSource: string;
    slots: ChunkSlots;
}
