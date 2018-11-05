
var Chunk = require( './chunk' );

function Flag( name, val ){

  Chunk.call( this, true, false );

  this.name = name;
  this._val = !!val;
}


Flag.prototype = Object.create( Chunk.prototype );
Flag.prototype.constructor = Flag;


Flag.prototype.enable = function( ){
  this.set( true );
};


Flag.prototype.disable = function( ){
  this.set( false );
};


Flag.prototype.set = function( val ){
  val = !! val;
  if( this._val !== val ){
    this._val = val;
    this.invalidate();
  }
};


Flag.prototype.genCode = function( slots ){
  var c;

  // PF
  c = '#define '+this.name+' '+ (~~this._val) +'\n';
  slots.add( 'definitions', c );

};


Flag.prototype.getHash = function(){
  return this.name       +'-'+
         (~~this._val);
};


module.exports = Flag;