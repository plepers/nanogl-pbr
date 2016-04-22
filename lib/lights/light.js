var Node = require( 'nanogl-node' );
var Fbo  = require( 'nanogl/fbo' );


function Light( gl ){
  Node.call( this );

  this.gl = gl;

  this._type  = 0;
  this._color = new Float32Array(3);
  this._wdir  = new Float32Array( this._wmatrix.buffer, 8*4, 3 );

  this._castShadows   = false;
  this._fbo           = null;
  this._camera        = null;

  this._shadowmapSize = 1024;
}


Light.prototype = Object.create( Node.prototype );
Light.prototype.constructor = Light;


Light.prototype.prepareShadowmap = function(){
  var s = this._shadowmapSize;

  if( this._fbo == null ){
    this._fbo = new Fbo( this.gl, s, s, {
      depth : true,
      format : this.gl.RGB
    });
  } else {
    this._fbo.resize( s, s );
  }

  this.fbo.bind()
};



Light.TYPE_DIR  = 1;
Light.TYPE_SPOT = 2;


module.exports = Light;