var Light    = require( './light' );
var template = require( '../../glsl/templates/spot-light' );

function SpotLight(){
  Light.call( this );
  this._type = Light.TYPE_SPOT;

  this._spotData    = new Float32Array( 2 );
  this._falloffData = new Float32Array( 3 );

  this._angle        = 0.0;
  this._sharpness    = 0.0;
  this._radius       = 0.0;
  this._falloffCurve = 0.0;

  this.angle        = Math.PI/4;
  this.sharpness    = 0.0;
  this.radius       = 10.0;
  this.falloffCurve = 2.0;
}


SpotLight.prototype = Object.create( Light.prototype );
SpotLight.prototype.constructor = SpotLight;


SpotLight.prototype.genCode = function( index, shadowIndex ){
  var o = {
    index : index,
    shadowIndex : shadowIndex
  };
  return template( o );
}


Object.defineProperty(SpotLight.prototype, "angle", {
    get: function(){ return this._angle},
    set: function(v){
      this._angle = v;
      this._updateSpotData();
    }
});


Object.defineProperty(SpotLight.prototype, "sharpness", {
    get: function(){ return this._sharpness},
    set: function(v){
      this._sharpness = v;
      this._updateSpotData();
    }
});


Object.defineProperty(SpotLight.prototype, "radius", {
    get: function(){ return this._radius},
    set: function(v){
      this._radius = v;
      this._updateFalloffData();
    }
});


Object.defineProperty(SpotLight.prototype, "falloffCurve", {
    get: function(){ return this._falloffCurve},
    set: function(v){
      this._falloffCurve = v;
      this._updateFalloffData();
    }
});


SpotLight.prototype._updateSpotData = function(){
  this._spotData[0] = 1.0 + (this._sharpness * 100.0 );
  this._spotData[1] = 2 / (1-Math.cos(this._angle)) * this._spotData[1];
}


SpotLight.prototype._updateFalloffData = function(){
  this._falloffData[0] = -this._falloffCurve;
  this._falloffData[1] = -1 + this._falloffCurve;
  this._falloffData[2] = 1/this._radius;
}

module.exports = SpotLight;