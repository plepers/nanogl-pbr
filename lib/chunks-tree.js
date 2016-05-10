var Chunk = require( './chunk' );



function ChunkSlots(){
  this.slots = []
  this.slotsMap = {}
}

ChunkSlots.prototype = {


  getSlot : function( id ){
    var s = this.slotsMap[id];
    if( s === undefined ){
      s = {
        key : id,
        code : ''
      };
      this.slotsMap[id] = s;
      this.slots.push( s );
    }
    return s;
  },


  add : function( slot, code ){
    // DEBUG
    if( code.indexOf( 'undefined')>-1 ){
      console.log( code )
      throw 'aie'
    }

    this.getSlot( slot ).code += code+'\n';
  }

}



function ChunksTree( material ){
  this.material = material;
  this._setups = [];
  this._codes  = [];
  this._flat   = [];

  this._root   = new Chunk();
  this._root.list = this;

  this._isDirty = true;
}

ChunksTree.prototype = {


  add : function( chunk ){
    return this._root.add( chunk );
  },


  addChunks : function( chunks ){
    for (var i = 0; i < chunks.length; i++) {
      this._root.add( chunks[i] );
    }
  },



  compile : function(){
    this._flatten();
  },


  _flatten : function(){
    var setups = this._setups,
        codes  = this._codes,
        chunks = this._flat;

    setups.length = 0;
    codes .length = 0;
    chunks.length = 0;

    this._root.traverse( setups, codes, chunks );

    this._isDirty = false;

  },


  getHash : function(){
    var codes = this._codes,
        res    = '';

    for (var i = 0; i < codes.length; i++) {
      res += codes[i].getHash();
    }

    return res;
  },


  getCode : function(){

    var codes  = this._codes,
        slots = new ChunkSlots();

    for (var i = 0; i < codes.length; i++) {
      codes[i].genCode( slots );
    }

    return slots;
  }


}

module.exports = ChunksTree;