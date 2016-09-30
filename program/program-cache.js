var Program = require( './program' );

var PRAGMA_SLOT = '#pragma SLOT';
var PRAGMA_REGEX = /^\s*#pragma SLOT\s\w+\s*$/gm;


function ProgramCache( gl ){
  this.gl = gl;
  this._cache = {};
}


ProgramCache.prototype = {

  compile : function( pass ){

    var inputs = pass.inputs;

    inputs.compile();

    hash = inputs.getHash();
    hash +=  pass._uid + pass._precision;
    // console.log( hash )

    var cached = this._cache[hash];
    if( cached !== undefined ){
      cached.usage ++;
      return cached;
    }

    var slots = inputs.getCode();

    var vert = this.processSlots( pass._vertSrc, slots );
    var frag = this.processSlots( pass._fragSrc, slots );

    var defs = 'precision ' + pass._precision + ' float;\n';
    // console.log( frag )
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
  },


  processSlots : function( code, slots ){

    for (var i = 0; i < slots.slots.length; i++) {
      var scode = slots.slots[i].code;
      var key = slots.slots[i].key;
      code = code.replace( PRAGMA_SLOT+' '+key, scode );
    }

    // cleanup unmatched slots
    PRAGMA_REGEX.lastIndex = 0;
    code = code.replace( PRAGMA_REGEX, '' );

    return code;
  }

};


ProgramCache.getCache = function( gl ){
  if( gl._prgcache === undefined ){
    gl._prgcache = new ProgramCache( gl );
  }
  return gl._prgcache;
};


module.exports = ProgramCache;