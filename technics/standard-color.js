var glslify      = require( 'glslify' );
var RenderPass   = require( './render-pass' );



var M4 = new Float32Array( 16 );



function StandardColorPass( gl, technic ){

  RenderPass.call( this, gl, technic );

  this._uid       = 'std_c';
  this._precision = 'highp';
  this._vertSrc   = glslify( '../glsl/pbr.vert' );
  this._fragSrc   = glslify( '../glsl/pbr.frag' );

}



StandardColorPass.prototype = Object.create( RenderPass.prototype );
StandardColorPass.prototype.constructor = StandardColorPass;



StandardColorPass.prototype.setIBL = function( ibl ){
  this.inputs.addChunks( ibl.getChunks() );
};


StandardColorPass.prototype.setLightSetup = function( setup ){
  this.inputs.addChunks( setup.getChunks() );
};


// render time !
// ----------
StandardColorPass.prototype.prepare = function( node, camera ){
  RenderPass.prototype.prepare.call( this, node, camera );

  this.ibl.setupProgram( prg );

  // matrices
  camera.modelViewProjectionMatrix( M4, node._wmatrix );
  prg.uMVP(          M4            );
  prg.uWorldMatrix(  node._wmatrix );

  //
  prg.uCameraPosition( camera._wposition );

};



module.exports = StandardColorPass;