
var Chunk = require( './chunk' );

/**
manage float precision qualifier only
**/

function ShaderPrecision( p ){
  
  Chunk.call( this, true, false);

  this.fprecision = (p===undefined)?'mediump':p;
  this.fprecision = p;
}


ShaderPrecision.prototype = Object.create( Chunk.prototype );
ShaderPrecision.prototype.constructor = ShaderPrecision;


ShaderPrecision.prototype.set = function( p ){
  this.fprecision = p;
};


ShaderPrecision.prototype.getHash = function(){
  return 'p'+this.fprecision;
};


ShaderPrecision.prototype.genCode = function( slots ){
  var s = 'precision '+this.fprecision+' float;\n';
  slots.add( 'precision', s );
};


module.exports = ShaderPrecision;
