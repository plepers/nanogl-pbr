var Node = require( 'nanogl-node' );
var Fbo  = require( 'nanogl/fbo' );
var mat4 = require( 'gl-matrix/src/gl-matrix/mat4' );


// for shadow proj
var ScreenMtx = mat4.fromValues(
  0.5, 0, 0, 0,
  0, 0.5, 0, 0,
  0, 0, 0.5, 0,
  .5, .5, .5, 1 );
var LightMtx  = mat4.create();



function Light( gl ){
  Node.call( this );

  this.gl = gl;

  this._type  = 0;
  this._color = new Float32Array([1.0, 1.0, 1.0]);
  this._wdir  = new Float32Array( this._wmatrix.buffer, 8*4, 3 );

  this._castShadows   = false;
  this._fbo           = null;
  this._camera        = null;

  this._shadowmapSize = 1024;
}


Light.prototype = Object.create( Node.prototype );
Light.prototype.constructor = Light;


Light.prototype.getShadowProjection = function(){
  this._camera.updateViewProjectionMatrix( 1, 1 );
  mat4.multiply( LightMtx, ScreenMtx, this._camera._viewProj );
  return LightMtx;
};



Light.prototype.castShadows = function( flag ){
  if( this._castShadows !== flag ) {
    this._castShadows = flag;
    ( flag ) ? this._initShadowMapping() : this._releaseShadowMapping();
  }
};



Light.prototype._initShadowMapping= function( flag ){
  var s = this._shadowmapSize;
  this._fbo = new Fbo( this.gl, s, s, {
    depth : true,
    format : this.gl.RGB
  });
  this._fbo.color.setFilter( false, false, false );
  this._camera = this._createCamera();
  this.add( this._camera );
};


Light.prototype._releaseShadowMapping= function( flag ){
  this._fbo.dispose()
  this._fbo = null;
  this.remove( this._camera );
  this._camera = null;
};


Light.prototype._createCamera= function(  ){
  // abstract
};


Light.prototype.prepareShadowmap = function(){
  var s = this._shadowmapSize;
  this._fbo.resize( s, s );
  this._fbo.bind()
};



Light.TYPE_DIR  = 1;
Light.TYPE_SPOT = 2;


module.exports = Light;