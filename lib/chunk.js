

function Chunk( hasCode, hasSetup ){

  this.list     = null;
  this.children = [];
  this.parent   = null;

  // is generate glsl code
  this._hasCode  = !!hasCode;

  // is setup program (uniforms)
  this._hasSetup = !!hasSetup;

  // setup is invalid (need reupload uniform)
  this._invalid  = true;

  // optional proxies
  this._proxies = [];



}


Chunk.prototype = {


  genCode : function( chunks ){
    return '';
  },


  getHash : function(){
    return '';
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
    child.parent = this;
    for (var i = 0; i < this._proxies.length; i++) {
      this._proxies[i].add( child.createProxy() );
    }

    this.invalidate();
    return child;
  },


  remove : function( child ){
    var i = this.children.indexOf( child );
    if( i > -1 ){
      this.children.splice( i, 1 );
      child.parent = null;
      child.removeProxies();
    }
    this.invalidate();
  },


  setList : function( list ){
    this.list = list;
    this.invalidate();

    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setList( list );
    }

  },


  traverse : function( setups, codes, chunks ){

    if( chunks.indexOf( this ) === -1 ){

      for (var i = 0; i < this.children.length; i++) {
        this.children[i].traverse( setups, codes, chunks );
      }

      if( this._hasSetup ){
        setups.push( this );
      }

      if( this._hasCode ){
        codes.push( this );
      }

      chunks.push( this );
    }

  },


  invalidate : function(){
    if( this.list ){
      this.list._isDirty = true;
    }
    for (var i = 0; i < this._proxies.length; i++) {
      this._proxies[i].invalidate();
    }
  },


  createProxy : function(){
    var p = new Proxy( this );    
    for (var i = 0; i < this.children.length; i++) {
      p.add( this.children[i].createProxy() );
    }
    this._proxies.push( p );
    return p;
  },


  releaseProxy : function( p ){
    var i = this._proxies.indexOf( p );
    if( i > -1 ){
      this._proxies.splice( i, 1 );
    }
  },


  removeProxies : function(){

    for (var i = 0; i < this._proxies.length; i++) {
      var p = this._proxies[i];
      if( p.parent !== null ){
        p.parent.remove( p );
      }
    }
  }


};

// =======================================
//                    PROXIES
// =======================================

function Proxy( ref ){
  Chunk.call( this, ref._hasCode, ref._hasSetup );
  this._ref = ref;
}


Proxy.prototype = Object.create( Chunk.prototype );
Proxy.prototype.constructor = Proxy;

Proxy.prototype.genCode = function(chunk){   this._ref.genCode(chunk);   };
Proxy.prototype.getHash = function(     ){   return this._ref.getHash();        };
Proxy.prototype.setup   = function( prg ){   this._ref.setup( prg );     };

Proxy.prototype.release = function(){
  this._ref.releaseProxy( this );
  this._ref = null;
};



// =======================================
//                  MODULE
// =======================================


Chunk.Proxy = Proxy;

module.exports = Chunk;