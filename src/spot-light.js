var Light    = require( './light' );
var Camera   = require( 'nanogl-camera' );

var BiasVector = new Float32Array(4);

function SpotLight( gl ){
  Light.call( this, gl );
  this._type = Light.TYPE_SPOT;

  this._spotData     = new Float32Array( 2 );
  this._falloffData  = new Float32Array( 3 );

  this._angle        = 0.0;
  this._sharpness    = 0.0;
  this._radius       = 0.0;
  this._falloffCurve = 0.0;

  this.angle         = Math.PI/4;
  this.sharpness     = 0.0;
  this.radius        = 50.0;
  this.falloffCurve  = 2.0;
}


SpotLight.prototype = Object.create( Light.prototype );
SpotLight.prototype.constructor = SpotLight;



SpotLight.prototype.projectionFromBounds = function( bounds ){

  var oBounds = this.boundsInLocalSpace( bounds );
  var zMin = -oBounds[2],
      zMax = -oBounds[5];

  zMin = Math.min(zMin, 1 / this._falloffData[2] );
  zMax = Math.max(0.005 * zMin, zMax);

  this._camera.lens.near = zMax;
  this._camera.lens.far  = zMin;
};


SpotLight.prototype.getTexelBiasVector = function(){
  var mtx = this._camera._view;
  var zMin = -2.0 * Math.tan( this._angle );
  BiasVector[0] = mtx[2]  * zMin;
  BiasVector[1] = mtx[6]  * zMin;
  BiasVector[2] = mtx[10] * zMin;
  BiasVector[3] = mtx[14] * zMin;
  return BiasVector;
};


SpotLight.prototype._createCamera= function(  ){
  var cam = Camera.makePerspectiveCamera();
  cam.lens.aspect = 1;
  cam.lens.fov = this._angle;
  cam.lens.near = 15 - 5
  cam.lens.far  = 15 + 5
  return cam;
};



Object.defineProperty(SpotLight.prototype, "angle", {
    get: function(){ return this._angle; },
    set: function(v){
      this._angle = v;
      this._updateSpotData();
      if( this._castShadows ){
        this._camera.lens.fov = this._angle;
      }
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
  this._spotData[1] = 2 / (1-Math.cos(this._angle)) * this._spotData[0];
}


SpotLight.prototype._updateFalloffData = function(){
  this._falloffData[0] = -this._falloffCurve;
  this._falloffData[1] = -1 + this._falloffCurve;
  this._falloffData[2] = 1/this._radius;
}

module.exports = SpotLight;