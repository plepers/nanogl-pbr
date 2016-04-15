var Program      = require( 'nanogl/program' );
var glslify      = require( 'glslify' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var InputList    = require('./lib/input-list' );


var M4           = require( 'gl-matrix' ).mat4.create();



function StandardMaterial( gl ){
  this.ibl = null;
  this.prg = null;


  this.inputs      = new InputList();
  this.iAlbedo     = this.inputs.add( 'albedo',    3 );
  this.iSpecular   = this.inputs.add( 'specular',  3 );
  this.iGloss      = this.inputs.add( 'gloss',     1 );
  this.iNormal     = this.inputs.add( 'normal',    3 );
  this.iOcclusion  = this.inputs.add( 'occlusion', 1 );
  this.iFresnel    = this.inputs.add( 'fresnel',   3 );



  this._prgcache = ProgramCache.getCache( gl );
  // for program-cache
  this._uid       = 'std';
  this._vertSrc   = glslify( './glsl/pbr.vert' );
  this._fragSrc   = glslify( './glsl/pbr.frag' );
  this._precision = 'highp'


}

StandardMaterial.prototype = {


  setIBL : function( ibl ){
    this.ibl = ibl;
  },


  // render time !
  // ----------
  prepare : function( node, camera ){

    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg;
    prg.use()

    prg.setupInputs( this )

    this.ibl.setupProgram( prg );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP(          M4            );
    prg.uWorldMatrix(  node._wmatrix );

    //
    prg.uCameraPosition( camera._wposition );

  },



  // need recompilation
  _isDirty : function(){
    if( this.prg === null || this.inputs._isDirty() ){
      return true;
    }
    return false;
  },


  compile : function(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



}

module.exports = StandardMaterial;