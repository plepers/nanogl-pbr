import { Hash } from "./Hash";
declare class HashedChunkCode {
    code: string;
    hash: Hash;
    constructor(code: string);
}
declare class ChunkSlot {
    readonly key: string;
    private _hash;
    private hashset;
    private codes;
    private _code;
    constructor(key: string);
    add(code: HashedChunkCode): void;
    merge(other: ChunkSlot): void;
    get code(): string;
    get hash(): Hash;
}
export default class ChunksSlots {
    slots: ChunkSlot[];
    slotsMap: Record<string, ChunkSlot>;
    hash: Hash;
    constructor();
    getHash(): Hash;
    getSlot(id: string): ChunkSlot;
    add(slotId: string, code: string): void;
    merge(other: ChunksSlots): void;
}
export {};
