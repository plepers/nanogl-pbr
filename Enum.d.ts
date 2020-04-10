import Chunk from './Chunk';
import ChunksSlots from './ChunksSlots';
declare class Enum<T extends readonly string[]> extends Chunk {
    name: string;
    values: T;
    private _val;
    private _valIndex;
    private _enumDefs;
    private _accesDef;
    constructor(name: string, penum: T);
    value(): T[number];
    set(val: T[number]): void;
    _genCode(slots: ChunksSlots): void;
}
export default Enum;
