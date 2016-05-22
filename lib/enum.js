
var Chunk = require( './chunk' );

function Enum( name, values ){

  Chunk.call( this, true, false );

  this.name   = name;
  this.values = values;
  this._val   = values[0];

}

Enum.prototype = Object.create( Chunk.prototype );
Enum.prototype.constructor = Enum;


Enum.prototype.set = function( val ){

  if( this._val !== val ){
    if( val !== null && this.values.indexOf( val ) === -1 ){
      throw new Error( 'invalide Enum value :'+val )
    }
    this._val = val;
    this.invalidate();
  }
};


Enum.prototype.genCode = function( slots ){

  // PF
  var c = '';


  for (var i = 0; i < this.values.length; i++) {
    c += '#define '+this.values[i]+' '+ (i+1) +'\n';
  }
  c += '#define VAL_'+this.name+' '+ this._val +'\n';
  c += '#define '+this.name+'(k) VAL_'+this.name+' == k\n';
  slots.add( 'pf', c );
  slots.add( 'pv', c );

};


Enum.prototype.getHash = function(){
  return this.values.indexOf( this._val )       +'/'+
         this.name;
};


module.exports = Enum;
