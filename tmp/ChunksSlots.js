class ChunkSlots {
    constructor() {
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
}
;
export default ChunkSlots;
