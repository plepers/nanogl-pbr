import Program from "nanogl/program";
import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
import { mat4 } from "gl-matrix";
export type SkinAttributeSet = {
    weightsAttrib: string;
    jointsAttrib: string;
    numComponents: 1 | 2 | 3 | 4;
};
export default class SkinDeformer extends Chunk {
    _attributeSets: SkinAttributeSet[];
    _numJoints: number;
    private _jointsBuffer;
    private _jointMatrices;
    constructor(numJoints: number, sets: SkinAttributeSet[]);
    get numJoints(): number;
    get jointMatrices(): mat4[];
    setup(prg: Program): void;
    protected _genCode(slots: ChunksSlots): void;
}
