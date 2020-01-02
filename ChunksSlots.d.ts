declare type Slot = {
    key: string;
    code: string;
};
declare class ChunkSlots {
    slots: Slot[];
    slotsMap: Record<string, Slot>;
    constructor();
    getSlot(id: string): Slot;
    add(slotId: string, code: string): void;
}
export default ChunkSlots;
