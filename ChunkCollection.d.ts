import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
import Program from 'nanogl/program';
export declare const enum DirtyFlag {
    None = 0,
    Code = 1,
    Hierarchy = 2,
    All = 3
}
export default class ChunkCollection {
    _dirtyFlags: DirtyFlag;
    _chunks: Chunk[];
    _all: Chunk[];
    _actives: Chunk[];
    _setups: Chunk[];
    constructor();
    add<T extends Chunk>(chunk: T): T;
    remove(chunk: Chunk): void;
    addChunks(chunks: Chunk[]): void;
    compile(): void;
    invalidate(flag: DirtyFlag): void;
    isInvalid(): boolean;
    _collectChunks(): void;
    setupProgram(prg: Program): void;
    getHash(): string;
    getCode(): ChunkSlots;
}
