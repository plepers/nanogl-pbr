var Node    = require( 'nanogl-node' );
var Texture = require( 'nanogl/texture' );
var Fbo     = require( 'nanogl/fbo' );
var RB      = require( 'nanogl/renderbuffer' );
var PF      = require( 'nanogl-pf' )
var mat4    = require( 'gl-matrix/src/gl-matrix/mat4' );
var vec3    = require( 'gl-matrix/src/gl-matrix/vec3' );


// for shadow proj
var ScreenMtx = new Float32Array([
  0.5, 0, 0, 0,
  0, 0.5, 0, 0,
  0, 0, 0.5, 0,
  .5, .5, .5, 1
]);

var LightMtx  = mat4.create();
var V6 = new Float32Array( 6 );
var V3 = vec3.create();


function Light( gl ){
  Node.call( this );

  this.gl = gl;

  this._type  = 0;
  this._color = new Float32Array([1.0, 1.0, 1.0]);
  this._wdir  = new Float32Array( this._wmatrix.buffer, 8*4, 3 );

  this._castShadows   = false;
  this._fbo           = null;
  this._camera        = null;

  this._shadowmapSize = 512;
  this.iblShadowing   = .5;
}


Light.prototype = Object.create( Node.prototype );
Light.prototype.constructor = Light;


Light.prototype.getShadowProjection = function( bounds ){
  this.projectionFromBounds( bounds );
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


/**
 * return true if shadowmap support depth texture
 */
Light.prototype.hasDepthShadowmap = function(){
  return this._castShadows && this._fbo.getAttachment( this.gl.DEPTH_ATTACHMENT ).isTexture();
};

/**
 * return fbo color if depth_texture is not supported
 * otherwise return depth texture
 * return null if light don't cast shadows
 */
Light.prototype.getShadowmap = function(){
  if( this._castShadows ){
    var att = this._fbo.getAttachment( this.gl.DEPTH_ATTACHMENT );
    return att.isTexture() ? att.target : this._fbo.getAttachment( this.gl.COLOR_ATTACHMENT0 ).target;
  }
  return null;
};



Light.prototype._initShadowMapping= function( flag ){
  var s = this._shadowmapSize;
  var gl = this.gl;


  // color attachment
  // ----------------
  this._fbo = new Fbo( gl );
  this._fbo.bind();
  this._fbo.resize( s, s );
  this._fbo.attach( gl.COLOR_ATTACHMENT0, new Texture( gl, gl.RGB ) );
  
  
  // depth attachment
  // ----------------
  // use depth texture if possible
  var hasDTex = PF.getInstance(gl).hasDepthTexture();
  this._fbo.attachDepth( true, false, true );



  var smap = this.getShadowmap();
  smap.bind()

  var gl = this.gl;
  if( gl.COMPARE_REF_TO_TEXTURE ) { 
    // TODO filtering option for GLSL 300
    smap.setFilter( true, false, false );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE );
  } else {
    smap.setFilter( false, false, false );
  }


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
  this._fbo.bind();
  this._fbo.defaultViewport();
};


Light.prototype.boundsInLocalSpace = function( bounds )
{
  V6[0] = V6[1] = V6[2] =  Number.MAX_VALUE;
  V6[3] = V6[4] = V6[5] = -Number.MAX_VALUE;

  for ( var bCorner = 0; 8 > bCorner; bCorner++ ) {
    V3[0] = (bCorner & 1) ? bounds.max[0] : bounds.min[0];
    V3[1] = (bCorner & 2) ? bounds.max[1] : bounds.min[1];
    V3[2] = (bCorner & 4) ? bounds.max[2] : bounds.min[2];

    vec3.transformMat4( V3, V3, this._camera._view );

    V6[0] = Math.min( V6[0], V3[0] );
    V6[1] = Math.min( V6[1], V3[1] );
    V6[2] = Math.min( V6[2], V3[2] );
    V6[3] = Math.max( V6[3], V3[0] );
    V6[4] = Math.max( V6[4], V3[1] );
    V6[5] = Math.max( V6[5], V3[2] );
  }
  return V6;
}



Light.TYPE_DIR   = 1;
Light.TYPE_SPOT  = 2;
Light.TYPE_POINT = 4;


module.exports = Light;