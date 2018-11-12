
var Chunk = require( './chunk' );


function ShaderVersion( v ){
  Chunk.call( this, true, false);
  this.version = (v===undefined)?'100':v;
}


ShaderVersion.prototype = Object.create( Chunk.prototype );
ShaderVersion.prototype.constructor = ShaderVersion;



ShaderVersion.prototype.set = function(v){
  this.version = v;
  this.invalidate();
};


ShaderVersion.prototype.getHash = function(){
  return 'v'+this.version;
};


ShaderVersion.prototype.genCode = function( slots ){
  var s = '#version '+this.version+'\n';
  slots.add( 'version', s );
};


module.exports = ShaderVersion;
