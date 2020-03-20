import Chunk from './Chunk';
import ChunkSlots from './ChunksSlots';
declare type GlslVersion = '100' | '300 es';
declare class ShaderVersion extends Chunk {
    private version;
    constructor(v?: GlslVersion);
    set(v: GlslVersion): void;
    get(): GlslVersion;
    _getHash(): number;
    _genCode(slots: ChunkSlots): void;
}
export default ShaderVersion;
