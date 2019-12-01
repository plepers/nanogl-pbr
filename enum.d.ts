import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
declare class Enum<TEnum = any> extends Chunk {
    name: string;
    values: (keyof TEnum)[];
    private _val;
    constructor(name: string, penum: TEnum);
    set(val: keyof TEnum): void;
    genCode(slots: ChunkSlots): void;
    getHash(): string;
}
export default Enum;
