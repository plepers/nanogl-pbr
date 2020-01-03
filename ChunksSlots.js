class ChunkSlots {
    constructor() {
        this.slots = [];
        this.slotsMap = {};
        this.hash = '';
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
        for (var os of other.slots) {
            this.add(os.key, os.code);
        }
    }
}
;
export default ChunkSlots;
