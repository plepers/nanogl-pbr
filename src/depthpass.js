var Program      = require( 'nanogl/program' );
var Config       = require( 'nanogl-state/config' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var Flag         = require('./lib/flag' );
var Enum         = require('./lib/enum' );
var ChunksList   = require('./lib/chunks-tree' );


var M4           = require( 'gl-matrix' ).mat4.create();



function DepthPass( gl ){
  this.ibl = null;
  this.prg = null;


  this.inputs          = new ChunksList();


  this.depthFormat = new Enum( 'depthFormat', [
    'D_RGB',
    'D_DEPTH'
  ]);
  this.inputs.add( this.depthFormat );
  

  this.config    = new Config();

  this._prgcache = ProgramCache.getCache( gl );

  // for program-cache
  this._uid       = 'stddepth';
  this._precision = 'highp';
  this._vertSrc   = require( './glsl/depthpass.vert' )();
  this._fragSrc   = require( './glsl/depthpass.frag' )();


}

DepthPass.prototype = {



  setLightSetup : function( setup ){
    this.inputs.remove( this.depthFormat );
    this.depthFormat = setup.depthFormat.createProxy();
    this.inputs.add( this.depthFormat );
  },

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