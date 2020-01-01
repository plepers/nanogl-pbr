import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
declare class Flag extends Chunk {
    name: string;
    private _val;
    constructor(name: string, val?: boolean);
    enable(): void;
    disable(): void;
    set(val?: boolean): void;
    _genCode(slots: ChunkSlots): void;
    _getHash(): string;
}
export default Flag;
