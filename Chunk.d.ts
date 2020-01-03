import Program from 'nanogl/program';
import ChunksTree from './ChunkCollection';
import ChunkSlots from './ChunksSlots';
export default abstract class Chunk {
    private _lists;
    protected _hasCode: boolean;
    protected _hasSetup: boolean;
    protected _invalid: boolean;
    protected _ref: this | null;
    protected _children: Chunk[];
    constructor(hasCode?: boolean, hasSetup?: boolean);
    collectChunks(all: Chunk[], actives: Chunk[]): void;
    addChild<T extends Chunk>(child: T): T;
    removeChild(child: Chunk): void;
    genCode(slots: ChunkSlots): void;
    getHash(): string;
    get hasCode(): boolean;
    get hasSetup(): boolean;
    get isInvalid(): boolean;
    protected abstract _genCode(slots: ChunkSlots): void;
    protected abstract _getHash(): string;
    setup(prg: Program): void;
    addList(list: ChunksTree): void;
    removeList(list: ChunksTree): void;
    invalidateList(): void;
    invalidateCode(): void;
    proxy(ref?: this | null): void;
    createProxy(): Chunk;
}
