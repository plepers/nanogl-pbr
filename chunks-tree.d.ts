import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
declare class ChunksTree {
    _root: Chunk;
    _isDirty: boolean;
    _setups: Chunk[];
    _codes: Chunk[];
    _flat: Chunk[];
    constructor();
    add<T extends Chunk>(chunk: T): T;
    remove(chunk: Chunk): void;
    addChunks(chunks: Chunk[]): void;
    compile(): void;
    _flatten(): void;
    getHash(): string;
    getCode(): ChunkSlots;
}
export default ChunksTree;
