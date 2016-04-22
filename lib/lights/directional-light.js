var Light = require( './light' );


function DirectionalLight(){
  Light.call( this );
  this._type = Light.TYPE_DIR;
}


DirectionalLight.prototype = Object.create( Light.prototype );
DirectionalLight.prototype.constructor = DirectionalLight;


module.exports = DirectionalLight;