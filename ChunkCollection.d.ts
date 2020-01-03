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
    private _invalidList;
    private _invalidCode;
    private _revision;
    _chunks: Chunk[];
    _all: Chunk[];
    _actives: Chunk[];
    _setups: Chunk[];
    _codes: Chunk[];
    _cachedSlots: ChunkSlots | null;
    add<T extends Chunk>(chunk: T): T;
    remove(chunk: Chunk): void;
    addChunks(chunks: Chunk[]): void;
    invalidateList(): void;
    invalidateCode(): void;
    isInvalid(): boolean;
    getRevision(): number;
    _collectChunks(): void;
    setupProgram(prg: Program): void;
    getCode(base?: ChunkSlots): ChunkSlots;
}
