import Chunk from './Chunk';
import ChunksSlots from './ChunksSlots';
declare type GlslVersion = '100' | '300 es';
declare class ShaderVersion extends Chunk {
    private version;
    constructor(v?: GlslVersion);
    set(v: GlslVersion): void;
    get(): GlslVersion;
    _genCode(slots: ChunksSlots): void;
}
export default ShaderVersion;
