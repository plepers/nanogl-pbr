var Light = require( './light' );
var Chunk = require( '../chunk' );

var dirPreCode  = require( '../../glsl/templates/directional-lights-pre' );
var spotPreCode = require( '../../glsl/templates/spot-lights-pre' );


function LightSetup( ){

  this._datas = {}
  this._dataList = []

  var d;

  d = new DirDatas()
  this._datas[Light.TYPE_DIR] = d;
  this._dataList.push( d );

  d = new SpotDatas()
  this._datas[Light.TYPE_SPOT] = d;
  this._dataList.push( d );

}


LightSetup.prototype = {


  add : function( l ){
    var data = this._datas[l._type];
    data.addLight( l );
  },


  remove : function( l ){
    var data = this._datas[l._type];
    data.removeLight( l );
  },


  update : function(){
    for (var i = 0; i < this._dataList.length; i++) {
      this._dataList[i].update()
    }
  },


  getChunks : function(){
    var res = [];
    for (var i = 0; i < this._dataList.length; i++) {
      res[i] = this._dataList[i].createProxy()
    }
    return res;
  }


};


// =================================
//          ABSTRACT LIGHT DATA
// =================================

function LightDatas(){
  Chunk.call( this, true, true );

  this.type = 0;
  this.lights = [];
  this.preCodeTemplate = null;
}


LightDatas.prototype = Object.create( Chunk.prototype );
LightDatas.prototype.constructor = LightDatas;


LightDatas.prototype.addLight = function( l ){
  if( this.lights.indexOf( l ) === -1 ){
    this.lights.push( l );
    this.invalidate();
  }
};


LightDatas.prototype.removeLight = function( l ){
  var i = this._lights.indexOf( l );
  if( i > -1 ){
    this._lights.splice( i, 1 );
    this.invalidate()
  }
};


LightDatas.prototype.genCode = function( slots ){
  
  var code = this.preCodeTemplate({
    count : this.lights.length
  });
  slots.add( 'pf', code );

  
  code = ''
  for (var i = 0; i < this.lights.length; i++) {
    code += this.lights[i].genCode( i, -1 );
  }
  slots.add( 'lightsf', code );
};


LightDatas.prototype.getHash = function( ){
  var h = this.type+'';
  for (var i = 0; i < this.lights.length; i++) {
    h += -1; /// shadow?
  }
};



// =================================
//               SPOTS
// =================================

function SpotDatas(){
  LightDatas.call( this );

  this._directions = null;
  this._colors     = null;
  this._positions  = null;
  this._spot       = null;
  this._falloff    = null;

  this.preCodeTemplate = spotPreCode;
}


SpotDatas.prototype = Object.create( LightDatas.prototype );
SpotDatas.prototype.constructor = SpotDatas;


SpotDatas.prototype.allocate = function( n ){

  if( this._colors === null || this._colors.length/3 !== n ){
    this._directions = new Float32Array( n * 3 );
    this._colors     = new Float32Array( n * 3 );
    this._positions  = new Float32Array( n * 3 );
    this._spot       = new Float32Array( n * 2 );
    this._falloff    = new Float32Array( n * 3 );
  }
};


SpotDatas.prototype.update = function(){
  var lights = this.lights;
  this.allocate( lights.length);

  for (var i = 0; i < lights.length; i++) {
    var l = lights[i]
    this._directions.set( l._wdir,        i*3*4 )
    this._colors    .set( l._color,       i*3*4 )
    this._positions .set( l._wposition,   i*3*4 )
    this._spot      .set( l._spotData,    i*2*4 )
    this._falloff   .set( l._falloffData, i*3*4 )
  }

  this._invalid  = true;
};


SpotDatas.prototype.setup = function( prg ){
  prg.uLSpotDirections( this._directions );
  prg.uLSpotColors    ( this._colors     );
  prg.uLSpotPositions ( this._positions  );
  prg.uLSpotSpot      ( this._spot       );
  prg.uLSpotFalloff   ( this._falloff    );

  this._invalid  = false;
};



// =================================
//               DIRECTIONAL
// =================================


function DirDatas(){
  LightDatas.call( this );

  this._directions = null;
  this._colors     = null;
  this.preCodeTemplate = dirPreCode;
}



DirDatas.prototype = Object.create( LightDatas.prototype );
DirDatas.prototype.constructor = DirDatas;


DirDatas.prototype.allocate = function( n ){

  if( this._colors === null || this._colors.length/3 !== n ){
    this._directions = new Float32Array( n * 3 );
    this._colors     = new Float32Array( n * 3 );
  }
};


DirDatas.prototype.update = function(){
  var lights = this.lights;
  this.allocate( lights.length);

  for (var i = 0; i < lights.length; i++) {
    var l = lights[i]
    this._directions.set( l._wdir,  i*3*4 )
    this._colors    .set( l._color, i*3*4 )
  }

  this._invalid  = true;
};


DirDatas.prototype.setup = function( prg ){
  prg.uLDirDirections ( this._directions );
  prg.uLDirColors     ( this._colors     );
  this._invalid  = false;
};



module.exports = LightSetup;
