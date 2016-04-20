var Input = require( './input' );


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



function InputList( material ){
  this.material = material;
  this._params = [];
  this._inputs = [];
}

InputList.prototype = {


  add : function( input ){
    this[input.name] = input;
    this._inputs.push( input );
    return input;
  },


  compile : function(){
    this._collectParams();
  },


  _collectParams : function(){
    var params = this._params,
        inputs = this._inputs;

    params.length = 0;

    for (var i = 0; i < inputs.length; i++) {
      var p = inputs[i].param;
      if( p !== null && params.indexOf( p ) === -1 ){
        params.push( p );
      }
    }

  },


  getHash : function(){
    var params = this._params,
        inputs = this._inputs,
        res    = '';

    for (var i = 0; i < inputs.length; i++) {
      res += inputs[i]._makeHash();
    }

    for (var i = 0; i < params.length; i++) {
      res += params[i]._makeHash();
    }

    return res;
  },


  getChunks : function(){

    var params = this._params,
        inputs = this._inputs,
        chunks = CHUNKS();

    for (var i = 0; i < params.length; i++) {
      params[i].genCode( chunks );
    }

    for (var i = 0; i < inputs.length; i++) {
      inputs[i].genCode( chunks);
    }

    return chunks;
  },


  // need recompilation
  _isDirty : function(){
    for (var i = 0; i < this._inputs.length; i++) {
      if( this._inputs[i].isDirty() ) return true;
    }
    return false;
  },

}

module.exports = InputList;