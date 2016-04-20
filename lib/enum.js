
var Chunk = require( './chunk' );

function Enum( name ){

  Chunk.call( this, true, true );

  this.name = name;

}

Enum.prototype = Object.create( Chunk.prototype );
Enum.prototype.constructor = Enum;



Enum.prototype.enable = function( ){

  this._invalid  = true;
};


Enum.prototype.genCode = function( chunks ){
  var c;

  // PF
  c = '#define HAS_'+this.name+' '+ (~~this._val) +'\n';
  chunks.pf += c;

};


Enum.prototype.setup = function( prg ){
  prg[this.name]( this._value );
  this._invalid  = false;
};


Enum.prototype.getHash = function(){
  return
    this.size       +'/'+
    this.name;
};

