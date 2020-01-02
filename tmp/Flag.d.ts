import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
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
