import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
import { GlslPrecision } from './interfaces/precision';
declare class ShaderPrecision extends Chunk {
    private fprecision;
    constructor(p?: GlslPrecision);
    set(p: GlslPrecision): void;
    _getHash(): string;
    _genCode(slots: ChunkSlots): void;
}
export default ShaderPrecision;
