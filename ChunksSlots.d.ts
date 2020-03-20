import { Hash } from "./Hash";
export declare type ChunkSlot = {
    key: string;
    code: string;
};
export default class ChunkSlots {
    slots: ChunkSlot[];
    slotsMap: Record<string, ChunkSlot>;
    hash: Hash;
    constructor();
    getSlot(id: string): ChunkSlot;
    add(slotId: string, code: string): void;
    merge(other: ChunkSlots): void;
}
