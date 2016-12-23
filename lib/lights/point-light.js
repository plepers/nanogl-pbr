var Light    = require( './light' );
var Camera   = require( 'nanogl-camera' );

var BiasVector = new Float32Array(4);

function PointLight( gl ){
  Light.call( this, gl );
  this._type = Light.TYPE_POINT;

  this._falloffData  = new Float32Array( 3 );

  this._radius       = 0.0;
  this._falloffCurve = 0.0;

  this.radius        = 50.0;
  this.falloffCurve  = 2.0;
}


PointLight.prototype = Object.create( Light.prototype );
PointLight.prototype.constructor = PointLight;



PointLight.prototype.castShadows = function( flag ){
  return;
};


Object.defineProperty(PointLight.prototype, "radius", {
    get: function(){ return this._radius},
    set: function(v){
      this._radius = v;
      this._updateFalloffData();
    }
});


Object.defineProperty(PointLight.prototype, "falloffCurve", {
    get: function(){ return this._falloffCurve},
    set: function(v){
      this._falloffCurve = v;
      this._updateFalloffData();
    }
});



PointLight.prototype._updateFalloffData = function(){
  this._falloffData[0] = -this._falloffCurve;
  this._falloffData[1] = -1 + this._falloffCurve;
  this._falloffData[2] = 1/this._radius;
}

module.exports = PointLight;