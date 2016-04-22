var Light = require( './light' );


function LightSetup( ){

  this._lights = [];

  this.nDir  = 0;
  this.nSpot = 0;

  this._positions  = null;
  this._params     = null;
  this._spot       = null;

  this._directions = null;
  this._colors     = null;

}


LightSetup.prototype = {


  add : function( l ){
    if( this._lights.indexOf( l ) === -1 ){
      this._lights.push( l );
      switch( l._type ){
        case Light.TYPE_DIR  : this.nDir++;  break;
        case Light.TYPE_SPOT : this.nSpot++; break;
      }
    }
  },


  remove : function( l ){
    var i = this._lights.indexOf( l );
    if( i > -1 ){
      this._lights.splice( i, 1 );
      switch( l._type ){
        case Light.TYPE_DIR  : this.nDir--;  break;
        case Light.TYPE_SPOT : this.nSpot--; break;
      }
    }
  },


  update : function(){

  },


  setup : function( prg ){

  },


  _allocate : function(){
    var nLights = this._lights.length;
    if( this._colors === null || this._colors.length !== nLights ){
      this._directions = new Float32Array( nLights * 3 );
      this._colors     = new Float32Array( nLights * 3 );
    }

    if( this._spot === null || this._colors.length !== this.nSpot ){
      this._positions  = new Float32Array( this.nSpot *  );
      this._params     = new Float32Array( this.nSpot *  );
      this._spot       = new Float32Array( this.nSpot *  );
    }
  }

};


module.exports = LightSetup;
