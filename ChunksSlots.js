import { mergeHash } from "./Hash";
export default class ChunkSlots {
    constructor() {
        this.hash = 0;
        this.slots = [];
        this.slotsMap = {};
    }
    getSlot(id) {
        var s = this.slotsMap[id];
        if (s === undefined) {
            s = {
                key: id,
                code: ''
            };
            this.slotsMap[id] = s;
            this.slots.push(s);
        }
        return s;
    }
    add(slotId, code) {
        this.getSlot(slotId).code += code + '\n';
    }
    merge(other) {
        this.hash = mergeHash(this.hash, other.hash);
        for (var slot of other.slots) {
            this.add(slot.key, slot.code);
        }
    }
}
;
