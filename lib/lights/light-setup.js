var Enum   = require( '../enum' );
var Bounds = require( '../bounds' );

var StandardModel = require( './standard-model' );


function LightSetup( ){

  this._lights = [];
  this._models = [];
  this._modelsMap = {};

  // depth encoding
  this.depthFormat = new Enum( 'depthFormat', [
    'D_RGB',
    'D_DEPTH'
  ]);

  this.bounds = new Bounds();

  this.stdModel = new StandardModel();
  this._registerModel( 'std', this.stdModel );
}


LightSetup.prototype = {


  add : function( l ){
    if( this._lights.indexOf( l ) === -1 ){
      this._lights.push( l );

      for (var i = 0; i < this._models.length; i++) {
        this._models[i].add( l );
      }
    }
  },


  remove : function( l ){  
    var i = this. _lights.indexOf( l );
    if( i > -1 ){
      this._lights.splice( i, 1 );
      
      for ( i = 0; i < this._models.length; i++) {
        this._models[i].remove( l );
      }
    }
  },


  update : function(){
    for ( i = 0; i < this._models.length; i++) {
      this._models[i].update();
    }

  },


  getChunks : function( modelId ){
    if( modelId === undefined ){
      modelId = 'std';
    }
    
    var res = this._modelsMap[modelId].getChunks();
    res.unshift( this.depthFormat .createProxy() );
    return res;
  },


  _registerModel : function( id, model ){
    if( this._modelsMap[id] === undefined ){
      this._modelsMap[id] = model;
      this._models.push( model );
      model._setup = this;

      for (var i = 0; i < this._lights.length; i++) {
        model.add( this._lights[i] );
      };
    }
  }


};







module.exports = LightSetup;
