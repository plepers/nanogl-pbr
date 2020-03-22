import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
declare class Flag<T extends string = string> extends Chunk {
    name: T;
    private _val;
    constructor(name: T, val?: boolean);
    enable(): void;
    disable(): void;
    set(val?: boolean): void;
    _genCode(slots: ChunkSlots): void;
}
export default Flag;
