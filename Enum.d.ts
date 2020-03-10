import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
declare class Enum<T extends readonly string[]> extends Chunk {
    name: string;
    values: T;
    private _val;
    private _valIndex;
    private _enumDefs;
    private _accesDef;
    constructor(name: string, penum: T);
    set(val: T[number]): void;
    _genCode(slots: ChunkSlots): void;
    _getHash(): string;
}
export default Enum;
