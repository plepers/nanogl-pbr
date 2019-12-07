import Chunk from './chunk'
import ChunkSlots from './chunks-slots'




class RootChunk extends Chunk {
  
  getHash(): string {
    return '';
  }

  genCode(slots: ChunkSlots): void {}
  
  constructor(){
    super();
  }
  
}


class ChunksTree{

  _root: Chunk;
  _isDirty: boolean;

  _setups: Chunk[];
  _codes : Chunk[];
  _flat  : Chunk[];

  constructor(){

    this._setups = [];
    this._codes  = [];
    this._flat   = [];

    this._root   = new RootChunk();
    this._root.list = this;

    this._isDirty = true;
  }



  add<T extends Chunk>( chunk : T ) : T {
    return this._root.add( chunk );
  }

  remove( chunk : Chunk ){
    return this._root.remove( chunk );
  }


  addChunks( chunks : Chunk[] ){
    for (var i = 0; i < chunks.length; i++) {
      this._root.add( chunks[i] );
    }
  }



  compile(){
    this._flatten();
  }


  _flatten(){
    const setups = this._setups,
          codes  = this._codes,
          chunks = this._flat;

    setups.length = 0;
    codes .length = 0;
    chunks.length = 0;

    this._root.traverse( setups, codes, chunks );

    this._isDirty = false;

  }


  getHash(){
    let codes = this._codes,
        res    = '';

    for (var i = 0; i < codes.length; i++) {
      res += codes[i].getHash();
    }

    return res;
  }


  getCode(){

    const codes  = this._codes,
          slots = new ChunkSlots();

    for (var i = 0; i < codes.length; i++) {
      codes[i].genCode( slots );
    }

    return slots;
  }


};

export default ChunksTree