

var Program      = require( 'nanogl/program' );
var Config       = require( 'nanogl-state/config' );
var glslify      = require( 'glslify' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var Flag         = require('./lib/flag' );
var ChunksList   = require('./lib/chunks-tree' );


var M4           = require( 'gl-matrix' ).mat4.create();



function RenderPass( gl, technic ){

  this.prg      = null;
  this._technic = technic;

  this.inputs          = new ChunksList();
  this.config          = new Config();

  this._prgcache = ProgramCache.getCache( gl );
}



RenderPass.prototype = {


  prepare : function( node, camera ){

    if( this.prg === null || this.inputs._isDirty ){
      this.compile();
    }

    this.prg.use();
    this.prg.setupInputs( this );

  },


  compile : function(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



};

module.exports = RenderPass;