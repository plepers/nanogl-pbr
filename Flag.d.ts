import Chunk from './Chunk';
import ChunksSlots from './ChunksSlots';
declare class Flag<T extends string = string> extends Chunk {
    name: T;
    private _val;
    constructor(name: T, val?: boolean);
    enable(): void;
    disable(): void;
    set(val?: boolean): void;
    get value(): boolean;
    _genCode(slots: ChunksSlots): void;
}
export default Flag;
