import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
declare class Enum<T extends readonly string[]> extends Chunk {
    name: string;
    values: T;
    private _val;
    constructor(name: string, penum: T);
    set(val: T[number]): void;
    genCode(slots: ChunkSlots): void;
    getHash(): string;
}
export default Enum;
