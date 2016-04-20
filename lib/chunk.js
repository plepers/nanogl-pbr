

function Chunk( hasCode, hasSetup ){

  this.list = null;
  this.children = [];

  // is generate glsl code
  this._hasCode  = !!hasCode;

  // is setup program (uniforms)
  this._hasSetup = !!hasSetup;

  // setup is invalid (need reupload uniform)
  this._invalid  = true;



}


Chunk.prototype = {


  genCode : function( chunks ){
    return '';
  },


  getHash : function(){
    return ''
  },


  setup : function( prg ){
    // noop
  },


  add : function( child ){
    if( this.children.indexOf( child ) > -1 ){
      return;
    }
    this.children.push( child );
    child.setList( this.list );
    this.invalidate()
    return child;
  },


  remove : function( child ){
    var i = this.children.indexOf( child );
    if( i > -1 ){
      this.children.splice( i, 1 );
    }
    this.invalidate()
  },


  setList : function( list ){
    this.list = list;
    this.invalidate()

    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setList( list );
    }

  },


  traverse : function( setups, codes, chunks ){

    if( chunks.indexOf( this ) === -1 ){

      for (var i = 0; i < this.children.length; i++) {
        this.children[i].traverse( setups, codes, chunks )
      }

      if( this._hasSetup ){
        setups.push( this );
      }

      if( this._hasCode ){
        codes.push( this );
      }

      chunks.push( this )
    }

  },


  invalidate : function(){
    if( this.list ){
      this.list._isDirty = true;
    }
  }


}


module.exports = Chunk;