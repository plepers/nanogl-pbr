import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
import { GlslPrecision } from './interfaces/GlslPrecision';
declare class ShaderPrecision extends Chunk {
    private fprecision;
    constructor(p?: GlslPrecision);
    set(p: GlslPrecision): void;
    _getHash(): string;
    _genCode(slots: ChunkSlots): void;
}
export default ShaderPrecision;
