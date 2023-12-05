import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
import type { MorphAttribInfos } from "./MorphCode";
import Program from "nanogl/program";
export type Target = {
    attributes: string[];
};
export default class MorphDeformer extends Chunk {
    private _morphInfos;
    private _weights;
    constructor(infos: MorphAttribInfos[]);
    get weights(): Float32Array;
    set weights(w: Float32Array);
    get numTargets(): number;
    get morphInfos(): MorphAttribInfos[];
    setup(prg: Program): void;
    protected _genCode(slots: ChunksSlots): void;
    protected _getHash(): string;
}
