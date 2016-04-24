var Light    = require( './light' );
var template = require( '../../glsl/templates/directional-light' );
var Camera   = require( 'nanogl-camera' );



var BiasVector = new Float32Array(4);

function DirectionalLight( gl ){
  Light.call( this, gl );
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
};


DirectionalLight.prototype.getTexelBiasVector = function(){
  var cam = this._camera;
  BiasVector[3] = Math.max(cam._xMax - cam._xMin, cam._yMax - cam._yMin);
  return BiasVector;
};



DirectionalLight.prototype._createCamera= function(  ){
  return Camera.makeOrthoCamera();
};


module.exports = DirectionalLight;