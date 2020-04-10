import Chunk from "./Chunk";
import SkinCode, { JOINTS_UNIFORM } from "./SkinCode";
export default class SkinDeformer extends Chunk {
    constructor(numJoints, sets) {
        super(true, true);
        this._attributeSets = sets;
        this._numJoints = numJoints;
        this._jointsBuffer = new Float32Array(this._numJoints * 16);
        this._jointMatrices = [];
        const buff = this._jointsBuffer.buffer;
        for (let index = 0; index < this._numJoints; index++) {
            this._jointMatrices.push(new Float32Array(buff, index * 16 * 4, 16));
        }
    }
    get numJoints() {
        return this._numJoints;
    }
    get jointMatrices() {
        return this._jointMatrices;
    }
    setup(prg) {
        prg[JOINTS_UNIFORM](this._jointsBuffer);
    }
    _genCode(slots) {
        slots.add('pv', SkinCode.preVertexCode(this));
        slots.add('vertex_warp', SkinCode.vertexCode());
    }
}
