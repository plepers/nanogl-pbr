var Light    = require( './light' );
var template = require( '../../glsl/templates/directional-light' );
var Camera   = require( 'nanogl-camera' );



var BiasVector = new Float32Array(4);

function DirectionalLight( gl ){
  Light.call( this, gl );
  this._type = Light.TYPE_DIR;
  this._shadowmapNearOffset = 0;
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


DirectionalLight.prototype.projectionFromBounds = function( bounds ){

  var oBounds = this.boundsInLocalSpace( bounds );

  this._camera.lens.near = -oBounds[5] - this._shadowmapNearOffset;
  this._camera.lens.far  = -oBounds[2];
  this._camera.lens.setBound( oBounds[0], oBounds[3], oBounds[1], oBounds[4] );
};


DirectionalLight.prototype.getTexelBiasVector = function(){
  var ortho = this._camera.lens;
  BiasVector[3] = Math.max(ortho._xMax - ortho._xMin, ortho._yMax - ortho._yMin);
  return BiasVector;
};



DirectionalLight.prototype._createCamera= function(  ){
  return Camera.makeOrthoCamera();
};


module.exports = DirectionalLight;