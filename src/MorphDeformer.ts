import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
import MorphCode, {WEIGHTS_UNIFORM} from "./MorphCode";

import type { MorphAttribInfos } from "./MorphCode";
import Program from "nanogl/program";

/** @hidden */
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

/**
 * This class manages the code generation for morph deformers in a shader chunk.
 * It is used to deform a geometry using morph targets.
 *
 * You can change the weights of the morph targets using the `weights` property.
 *
 * @extends {Chunk}
 */
export default class MorphDeformer extends Chunk {
  /** The list of morph attribute definitions */
  private _morphInfos : MorphAttribInfos[] = [];
  /** The list of weights */
  private _weights    : Float32Array;

  /**
   * @param infos The list of morph attribute definitions
   */
  constructor( infos : MorphAttribInfos[] ) {
    super(true, true);

    validateInfos( infos )
    this._morphInfos = infos;
    this._weights = new Float32Array(this.numTargets);;
  }

  /**
   * Get the list of weights.
   */
  get weights() : Float32Array {
    return this._weights;
  }

  /**
   * Set the list of weights.
   * The length of the list must match the number of morph targets.
   *
   * @param {Float32Array} w The list of weights
   */
  set weights( w:Float32Array ) {
    if( w.length !== this.numTargets )
      throw new Error("MorphDeformer weights length and numMorph must match")
    this._weights = w;
  }

  /**
   * Get the number of morph targets.
   */
  get numTargets() : number {
    return this._morphInfos[0].attributes.length;
  }

  /**
   * Get the list of morph attribute definitions.
   */
  get morphInfos() : MorphAttribInfos[] {
    return this._morphInfos;
  }

  /**
   * Setup the given program for this morph deformer.
   * @param prg The program to setup
   */
  setup(prg: Program): void{
    prg[WEIGHTS_UNIFORM]( this._weights )
  }

  /**
   * Generate the vertex shader code for this morph deformer.
   * @param slots The slots to add the code to
   */
  protected _genCode(slots: ChunksSlots): void {
    slots.add('pv'         , MorphCode.preVertexCode(this));
    slots.add('vertex_warp', MorphCode.vertexCode( this ));
  }

  /**
   * Get the hash code for this chunk.
   */
  protected _getHash(): string {
    return 'mrph'
  }


}