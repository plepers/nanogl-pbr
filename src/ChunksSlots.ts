import { Hash, mergeHash, hashString } from "./Hash";

/**
 * This class manages shader chunk code and hashing.
 */
export class HashedChunkCode {
  /** The shader code */
  code: string;
  /** The hashed shader code */
  hash: Hash;

  /**
   * @param {string} code The shader code
   */
  constructor( code : string ){
    this.code = code;
    this.hash = hashString( code );
  }
}


/**
 * This class manages shader chunk slots.
 */
export class ChunkSlot {
  /** The id of this slot */
  readonly key: string;
  /** The complete hashed code for this slot */
  private _hash: number = 0;
  /** The list of hashed chunk code */
  private hashset: Set<Hash> = new Set();
  /** The list of chunk code */
  private codes: HashedChunkCode[] = [];
  /** The complete code for this slot */
  private _code : string = '';

  /**
   * @param {string} key The id of the slot
   */
  constructor( key : string ){
    this.key = key;
  }

  /**
   * Add chunk code to this slot.
   * @param {HashedChunkCode} code The chunk code to add
   */
  add( code : HashedChunkCode ){
    if( !this.hashset.has(code.hash ) ){
      this.hashset.add( code.hash )
      this.codes.push( code );
      this._code += code.code + '\n';
      this._hash = mergeHash( this._hash, code.hash );
    }
  }

  /**
   * Merge all code from given slot into this one.
   * @param {ChunkSlot} other The slot to merge into this one
   */
  merge( other : ChunkSlot ){
    for (const hcc of other.codes) {
      this.add( hcc );
    }
  }

  /**
   * Get the complete code for this slot.
   */
  get code() : string {
    return this._code;
  }

  /**
   * Get the complete hashed code for this slot.
   */
  get hash() : Hash {
    return this._hash;
  }

}



/**
 * This class manages the lists of shader chunk slots.
 */
export default class ChunksSlots {
  /** The list of chunk slots */
  slots   : ChunkSlot[];
  /** The list of id / chunk slots pairs */
  slotsMap: Record<string, ChunkSlot>;
  /** @hidden */
  hash: Hash = 0;


  constructor() {
    this.slots    = [];
    this.slotsMap = {};
  }

  /**
   * Get the hashed code for this ChunksSlots.
   */
  getHash() : Hash {
    let hash = 0;
    for (const slot of this.slots) {
      hash = mergeHash( hash, slot.hash );
    }
    return hash;
  }

  /**
   * Get a slot by its id.
   * @param {string} id The id of the slot
   */
  getSlot(id: string) {
    var s: ChunkSlot = this.slotsMap[id];
    if (s === undefined) {
      s = new ChunkSlot( id );
      this.slotsMap[id] = s;
      this.slots.push(s);
    }
    return s;
  }


  /**
   * Add chunk code to a slot.
   * @param {string} slotId The id for the slot where code will be inserted
   * @param {string} code The shader code to add
   */

  add(slotId: string, code: string) {
    this.getSlot(slotId).add( new HashedChunkCode( code ));
  }

  /**
   * Merge all hashed code from given ChunkSlots into this one.
   * @param {ChunksSlots} other The ChunkSlots to merge
   */
  merge( other : ChunksSlots ){
    for( var slot of other.slots ){
      this.getSlot(slot.key).merge( slot );
    }
  }


};
