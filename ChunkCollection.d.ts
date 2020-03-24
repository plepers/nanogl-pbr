import Chunk from './Chunk';
import ChunksSlots from './ChunksSlots';
import Program from 'nanogl/program';
export default class ChunkCollection {
    private _invalidList;
    private _invalidCode;
    private _revision;
    _all: Set<Chunk>;
    _actives: Set<Chunk>;
    _chunks: Chunk[];
    _setups: Chunk[];
    _codes: Chunk[];
    _cachedSlots: ChunksSlots | null;
    add<T extends Chunk>(chunk: T): T;
    remove(chunk: Chunk): void;
    addChunks(chunks: Chunk[]): void;
    invalidateList(): void;
    invalidateCode(): void;
    isInvalid(): boolean;
    getRevision(): number;
    _collectChunks(): void;
    setupProgram(prg: Program): void;
    getCode(base?: ChunksSlots): ChunksSlots;
}
