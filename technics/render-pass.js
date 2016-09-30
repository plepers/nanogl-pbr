

var Config       = require( 'nanogl-state/config' );

var ProgramCache = require( '../program/program-cache' );
var ChunksList   = require( '../chunk/chunks-tree' );



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