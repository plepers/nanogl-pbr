import Program from 'nanogl/program';
import ChunksTree from './chunks-tree';
import ChunkSlots from './chunks-slots';
declare abstract class Chunk {
    children: Chunk[];
    parent: Chunk | null;
    list: ChunksTree | null;
    _hasCode: boolean;
    _hasSetup: boolean;
    _invalid: boolean;
    _proxies: ChunkProxy[];
    constructor(hasCode?: boolean, hasSetup?: boolean);
    abstract genCode(slots: ChunkSlots): void;
    abstract getHash(): string;
    setup(prg: Program): void;
    add<T extends Chunk>(child: T): T;
    remove(child: Chunk): void;
    setList(list: ChunksTree | null): void;
    traverse(setups: Chunk[], codes: Chunk[], chunks: Chunk[]): void;
    invalidate(): void;
    createProxy(): ChunkProxy<this>;
    releaseProxy(p: ChunkProxy): void;
    removeProxies(): void;
}
export declare class ChunkProxy<TChunk extends Chunk = Chunk> extends Chunk {
    _ref: TChunk;
    constructor(ref: TChunk);
    genCode(chunk: ChunkSlots): void;
    getHash(): string;
    setup(prg: Program): void;
    release(): void;
}
export default Chunk;
