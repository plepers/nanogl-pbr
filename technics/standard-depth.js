var Program      = require( 'nanogl/program' );
var Config       = require( 'nanogl-state/config' );
var glslify      = require( 'glslify' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var Flag         = require('./lib/flag' );
var ChunksList   = require('./lib/chunks-tree' );

var RenderPass   = require( './render-pass' );


var M4           = require( 'gl-matrix' ).mat4.create();



function StandardColorPass( gl, technic ){

  RenderPass.call( this, gl, technic );

  this._uid       = 'std_d';
  this._precision = 'highp';
  this._vertSrc   = glslify( './glsl/depthpass.vert' );
  this._fragSrc   = glslify( './glsl/depthpass.frag' );

  this.depthTex        = this.inputs.add( new Flag ( 'depthTex',         false ) );

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