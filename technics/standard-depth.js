var glslify      = require( 'glslify' );
var RenderPass   = require( './render-pass' );


var M4 = new Float32Array( 16 );


function StandardDepthPass( gl, technic ){

  RenderPass.call( this, gl, technic );

  this._uid       = 'std_d';
  this._precision = 'highp';
  this._vertSrc   = glslify( '../glsl/depthpass.vert' );
  this._fragSrc   = glslify( '../glsl/depthpass.frag' );


  this.config
    .enableCullface( false )
    .enableDepthTest( )
    .depthMask( true )

}



StandardDepthPass.prototype = Object.create( RenderPass.prototype );
StandardDepthPass.prototype.constructor = StandardDepthPass;



// render time !
// ----------
StandardDepthPass.prototype.prepare = function( node, camera ){
  RenderPass.prototype.prepare.call( this, node, camera );

  camera.modelViewProjectionMatrix( M4, node._wmatrix );
  prg.uMVP( M4 );
};



module.exports = StandardDepthPass;