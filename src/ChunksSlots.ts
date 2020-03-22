import { Hash, mergeHash, hashString } from "./Hash";


class HashedChunkCode {
  code: string;
  hash: Hash;

  constructor( code : string ){
    this.code = code;
    this.hash = hashString( code );
  }
}



class ChunkSlot {
  readonly key: string;
  private _hash: number = 0;
  private hashset: Set<Hash> = new Set();
  private codes: HashedChunkCode[] = [];
  private _code : string = '';

  constructor( key : string ){
    this.key = key;
  }

  add( code : HashedChunkCode ){
    if( !this.hashset.has(code.hash ) ){
      this.hashset.add( code.hash )
      this.codes.push( code );
      this._code += code.code + '\n';
      this._hash = mergeHash( this._hash, code.hash );
    } 
  }

  merge( other : ChunkSlot ){
    for (const hcc of other.codes) {
      this.add( hcc );
    }
  }

  get code() : string {
    return this._code;
  }

  get hash() : Hash {
    return this._hash;
  }

}




export default class ChunkSlots {

  slots   : ChunkSlot[];
  slotsMap: Record<string, ChunkSlot>;
  hash: Hash = 0;


  constructor() {
    this.slots    = [];
    this.slotsMap = {};
  }

  getHash() : Hash {
    let hash = 0;
    for (const slot of this.slots) {
      hash = mergeHash( hash, slot.hash );
    }
    return hash;
  }

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
   * Called by Chunks to add code to shader slots
   * @param slotId the slot where code will be insterted
   * @param code the glsl code to inject
   */

  add(slotId: string, code: string) {
    this.getSlot(slotId).add( new HashedChunkCode( code ));
  }

  /**
   * merge all Hashed code from another ChunkSlots into this one
   * 
   */
  merge( other : ChunkSlots ){
    for( var slot of other.slots ){
      this.getSlot(slot.key).merge( slot );
    }
  }


};

