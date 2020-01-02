import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
import Program from 'nanogl/program';
declare class ChunksTree {
    _isDirty: boolean;
    _chunks: Chunk[];
    _all: Chunk[];
    _actives: Chunk[];
    _setups: Chunk[];
    constructor();
    add<T extends Chunk>(chunk: T): T;
    remove(chunk: Chunk): void;
    addChunks(chunks: Chunk[]): void;
    compile(): void;
    _collectChunks(): void;
    setupProgram(prg: Program): void;
    getHash(): string;
    getCode(): ChunkSlots;
}
export default ChunksTree;
