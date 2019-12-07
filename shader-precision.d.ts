import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
import { GlslPrecision } from './interfaces/precision';
declare class ShaderPrecision extends Chunk {
    private fprecision;
    constructor(p?: GlslPrecision);
    set(p: GlslPrecision): void;
    getHash(): string;
    genCode(slots: ChunkSlots): void;
}
export default ShaderPrecision;
