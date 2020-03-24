import Chunk from "./Chunk";
import MorphCode, { WEIGHTS_UNIFORM } from "./MorphCode";
function validateInfos(infos) {
    const numMorph = infos[0].attributes.length;
    for (let i = 1; i < infos.length; i++) {
        if (infos[i].attributes.length !== numMorph) {
            throw new Error('MorphDeformer mutiple morph dont have the same size');
        }
    }
}
export default class MorphDeformer extends Chunk {
    constructor(infos) {
        super(true, true);
        this._morphInfos = [];
        validateInfos(infos);
        this._morphInfos = infos;
        this._weights = new Float32Array(this.numTargets);
        ;
    }
    get weights() {
        return this._weights;
    }
    set weights(w) {
        if (w.length !== this.numTargets)
            throw new Error("MorphDeformer weights length and numMorph must match");
        this._weights = w;
    }
    get numTargets() {
        return this._morphInfos[0].attributes.length;
    }
    get morphInfos() {
        return this._morphInfos;
    }
    setup(prg) {
        prg[WEIGHTS_UNIFORM](this._weights);
    }
    _genCode(slots) {
        slots.add('pv', MorphCode.preVertexCode(this));
        slots.add('vertex_warp', MorphCode.vertexCode(this));
    }
    _getHash() {
        return 'mrph';
    }
}
