var Chunk = require( './chunk' );


var _CHUNKS = {
  pv : '',
  v  : '',
  pf : '',
  f  : ''
}

function CHUNKS(){
  _CHUNKS.pv  = '';
  _CHUNKS.v   = '';
  _CHUNKS.pf  = '';
  _CHUNKS.f   = '';
  return _CHUNKS;
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
    this._root.add( chunk );
  },



  compile : function(){
    this._flatten();
  },


  _flatten : function(){
    var setups = this._setups,
        codes  = this._codes,
        chunks = this._chunks;

    setups.length = 0;
    codes .length = 0;
    chunks.length = 0;

    this._root.traverse( setups, codes, chunks );

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

    var params = this._codes,
        chunks = CHUNKS();

    for (var i = 0; i < codes.length; i++) {
      codes[i].genCode( chunks );
    }

    return chunks;
  },


  // need recompilation
  _isDirty : function(){
    for (var i = 0; i < this._inputs.length; i++) {
      if( this._inputs[i].isDirty() ) return true;
    }
    return false;
  }

}

module.exports = ChunksTree;