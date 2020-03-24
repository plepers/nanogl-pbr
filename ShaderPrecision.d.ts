import Chunk from './Chunk';
import ChunksSlots from './ChunksSlots';
import { GlslPrecision } from './interfaces/GlslPrecision';
declare class ShaderPrecision extends Chunk {
    private fprecision;
    constructor(p?: GlslPrecision);
    set(p: GlslPrecision): void;
    _genCode(slots: ChunksSlots): void;
}
export default ShaderPrecision;
