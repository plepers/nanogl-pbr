declare type Slot = {
    key: string;
    code: string;
};
declare class ChunkSlots {
    slots: Slot[];
    slotsMap: Record<string, Slot>;
    hash: string;
    constructor();
    getSlot(id: string): Slot;
    add(slotId: string, code: string): void;
    merge(other: ChunkSlots): void;
}
export default ChunkSlots;
