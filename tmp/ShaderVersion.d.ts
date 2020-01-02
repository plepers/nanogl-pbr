import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
declare type GlslVersion = '100' | '300 es';
declare class ShaderVersion extends Chunk {
    version: GlslVersion;
    constructor(v?: GlslVersion);
    set(v: GlslVersion): void;
    _getHash(): string;
    _genCode(slots: ChunkSlots): void;
}
export default ShaderVersion;
