var Light    = require( './light' );
var template = require( '../../glsl/templates/directional-light' );

function DirectionalLight(){
  Light.call( this );
  this._type = Light.TYPE_DIR;
}


DirectionalLight.prototype = Object.create( Light.prototype );
DirectionalLight.prototype.constructor = DirectionalLight;


DirectionalLight.prototype.genCode = function( index, shadowIndex ){
  var o = {
    index : index,
    shadowIndex : shadowIndex
  };
  return template( o );
}


module.exports = DirectionalLight;