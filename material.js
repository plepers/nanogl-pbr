
var Config       = require( 'nanogl-state/config' );

function Material( gl ){

  this._mask = ~0;
  this.gl = gl;

  this._passes = {};
  this._passesPerTechnics = {};

  this.config = new Config();

}



Material.prototype = {

  getPass : function( technic ){
    var pass = this._passes[technic._uid];

    if( pass === undefined ){
      pass = this.createPass( technic );
      this.registerPass( pass );
    }

    return pass;
  },


  getPassesPerType : function( technicType ){
    return this._passesPerTechnics[technicType] || [];
  },


  createPass : function( technic ){
    //abstract
    return null;
  },


  registerPass : function( pass ) {
    var technic = pass._technic;

    this._passes[technic._uid] = pass;

    var perTech = this._passesPerTechnics[technic.type]
    if( perTech === undefined ){
      perTech = this._passesPerTechnics[technic.type] = [];
    }
    perTech.push( pass );
  }


};


module.exports = Material;