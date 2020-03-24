import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
import MorphCode, {WEIGHTS_UNIFORM} from "./MorphCode";

import type { MorphAttribInfos } from "./MorphCode";
import Program from "nanogl/program";


export type Target = {
  attributes : string[]
}

function validateInfos(infos: MorphAttribInfos[]) {
  const numMorph = infos[0].attributes.length;
  for (let i = 1; i < infos.length; i++) {
    if( infos[i].attributes.length !== numMorph ){
      throw new Error('MorphDeformer mutiple morph dont have the same size')
    }
  }
}

export default class MorphDeformer extends Chunk {

  private _morphInfos : MorphAttribInfos[] = [];
  private _weights    : Float32Array;

  constructor( infos : MorphAttribInfos[] ) {
    super(true, true);

    validateInfos( infos )
    this._morphInfos = infos;
    this._weights = new Float32Array(this.numTargets);;
  }

  get weights() : Float32Array {
    return this._weights;
  }
  
  set weights( w:Float32Array ) {
    if( w.length !== this.numTargets ) 
      throw new Error("MorphDeformer weights length and numMorph must match")
    this._weights = w;
  }

  get numTargets() : number {
    return this._morphInfos[0].attributes.length;
  }

  get morphInfos() : MorphAttribInfos[] {
    return this._morphInfos;
  }


  setup(prg: Program): void{
    prg[WEIGHTS_UNIFORM]( this._weights )
  }


  protected _genCode(slots: ChunksSlots): void {
    slots.add('pv'         , MorphCode.preVertexCode(this));
    slots.add('vertex_warp', MorphCode.vertexCode( this ));
  }

  protected _getHash(): string {
    return 'mrph'
  }


}