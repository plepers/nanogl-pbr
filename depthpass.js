var Program      = require( 'nanogl/program' );
var glslify      = require( 'glslify' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var Flag         = require('./lib/flag' );
var ChunksList   = require('./lib/chunks-tree' );


var M4           = require( 'gl-matrix' ).mat4.create();



function DepthPass( gl ){
  this.ibl = null;
  this.prg = null;


  this.inputs          = new ChunksList();
  this.depthTex        = this.inputs.add( new Flag ( 'depthTex',         false ) );

  this._prgcache = ProgramCache.getCache( gl );

  // for program-cache
  this._uid       = 'stddepth';
  this._precision = 'highp';
  this._vertSrc   = glslify( './glsl/depthpass.vert' );
  this._fragSrc   = glslify( './glsl/depthpass.frag' );


}

DepthPass.prototype = {



  // render time !
  // ----------
  prepare : function( node, camera ){

    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg;
    prg.use();

    prg.setupInputs( this );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP( M4 );

  },



  // need recompilation
  _isDirty : function(){
    return ( this.prg === null || this.inputs._isDirty );
  },


  compile : function(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



};

module.exports = DepthPass;