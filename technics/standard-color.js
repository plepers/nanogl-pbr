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

  this._uid       = 'std_c';
  this._precision = 'highp';
  this._vertSrc   = glslify( './glsl/pbr.vert' );
  this._fragSrc   = glslify( './glsl/pbr.frag' );



  this.iAlbedo         = this.inputs.add( new Input( 'albedo',          3 ) );
  this.iSpecular       = this.inputs.add( new Input( 'specular',        3 ) );
  this.iGloss          = this.inputs.add( new Input( 'gloss',           1 ) );
  this.iNormal         = this.inputs.add( new Input( 'normal',          3 ) );
  this.iOcclusion      = this.inputs.add( new Input( 'occlusion',       1 ) );
  this.iCavity         = this.inputs.add( new Input( 'cavity',          1 ) );
  this.iCavityStrength = this.inputs.add( new Input( 'cavityStrength',  2 ) );
  this.iEmissive       = this.inputs.add( new Input( 'emissive',        1 ) );
  this.iEmissiveScale  = this.inputs.add( new Input( 'emissiveScale',   1 ) );
  this.iFresnel        = this.inputs.add( new Input( 'fresnel',         3 ) );

  this.conserveEnergy  = this.inputs.add( new Flag ( 'conserveEnergy',  true  ) );
  this.perVertexIrrad  = this.inputs.add( new Flag ( 'perVertexIrrad',  false ) );
  this.glossNearest    = this.inputs.add( new Flag ( 'glossNearest',    false ) );
  this.tonemap         = this.inputs.add( new Flag ( 'tonemap',         true  ) );



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