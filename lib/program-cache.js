var Program = require( './program' );

var PRAGMA_P = '#pragma PRECODE'
var PRAGMA_C = '#pragma CODE'


function ProgramCache( gl ){
  this.gl = gl;
  this._cache = {};
}


ProgramCache.prototype = {

  compile : function( material ){

    var inputs = material.inputs;

    inputs.compile();

    hash = inputs.getHash();
    hash +=  material._uid + material._precision;
    console.log( hash )

    var cached = this._cache[hash]
    if( cached !== undefined ){
      cached.usage ++;
      return cached
    }

    var chunks = inputs.getCode();

    var vert = material._vertSrc
      .replace( PRAGMA_P, chunks.pv )
      .replace( PRAGMA_C, chunks.v  );

    var frag = material._fragSrc
      .replace( PRAGMA_P, chunks.pf )
      .replace( PRAGMA_C, chunks.f  );

    var defs = 'precision ' + material._precision + ' float;\n';
    console.log( frag )
    var prg = new Program( this.gl, vert, frag, defs );
    prg._usage ++;

    this._cache[hash] = prg;


    return prg;

  },

  // called by materials when prg is not used anymore
  release : function( prg ){
    // todo implement PrgCache.release
  },


  _addProgram : function( prg, hash ){
    this._cache[hash] = prg;
  }

}


ProgramCache.getCache = function( gl ){
  if( gl._prgcache === undefined ){
    gl._prgcache = new ProgramCache( gl );
  }
  return gl._prgcache;
}


module.exports = ProgramCache;