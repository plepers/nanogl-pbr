import Chunk from './chunk';
import ChunkSlots from './chunks-slots';
declare type GlslVersion = '100' | '300 es';
declare class ShaderVersion extends Chunk {
    version: GlslVersion;
    constructor(v?: GlslVersion);
    set(v: GlslVersion): void;
    getHash(): string;
    genCode(slots: ChunkSlots): void;
}
export default ShaderVersion;
