var Light  = require( './light' );
var Chunk  = require( '../chunk' );
var Bounds = require( '../bounds' );

var dirPreCode  = require( '../../glsl/templates/directional-lights-pre' );
var spotPreCode = require( '../../glsl/templates/spot-lights-pre' );
var shadPreCode = require( '../../glsl/templates/shadow-maps-pre' );


function LightSetup( ){

  this._datas = {}
  this._dataList = []

  var d;

  this.commonChunk = new CommonChunk();
  this.shadowChunk = new ShadowsChunk( this );

  d = new DirDatas()
  this._datas[Light.TYPE_DIR] = d;
  this._dataList.push( d );

  d = new SpotDatas()
  this._datas[Light.TYPE_SPOT] = d;
  this._dataList.push( d );

  this.bounds = new Bounds();
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
    this.shadowChunk.shadowCount      = 0;

    for (var i = 0; i < this._dataList.length; i++) {
      this._dataList[i].update( this )
    }

    this.shadowChunk.check();

  },


  getChunks : function(){
    var res = [];
    for (var i = 0; i < this._dataList.length; i++) {
      res[i] = this._dataList[i].createProxy()
    }
    res.unshift( this.commonChunk.createProxy() );
    res.unshift( this.shadowChunk.createProxy() );
    return res;
  }


};


// =================================
//          COMMON CHUNK
// =================================


function CommonChunk(){
  Chunk.call( this, true, false );
}


CommonChunk.prototype = Object.create( Chunk.prototype );
CommonChunk.prototype.constructor = CommonChunk;

CommonChunk.prototype.genCode = function( slots ){

  code =  'highp float roughness = -10.0 / log2( gloss()*0.968+0.03 );\n'+
          'roughness *= roughness;\n'+
          'float specularMul = roughness * (0.125/3.141592) + 0.5/3.141592;\n';


  slots.add( 'lightsf', code );
};


CommonChunk.prototype.getHash = function( ){
  return '0';
};



// =================================
//          SHADOWS CHUNK
// =================================

var MAX_SHADOWS = 4;


function ShadowsChunk( lightSetup ){
  Chunk.call( this, true, true );
  this.lightSetup       = lightSetup;
  this.shadowCount      = 0;
  this.genCount         = 0;
  this._matrices        = new Float32Array( MAX_SHADOWS * 16*4 );
  this._texelBiasVector = new Float32Array( MAX_SHADOWS * 4 *4 );
  this._shadowmapSizes  = new Float32Array( MAX_SHADOWS * 4 *2 );
  this._umatrices       = null;
  this._utexelBiasVector= null;
  this._ushadowmapSizes= null;
}


ShadowsChunk.prototype = Object.create( Chunk.prototype );
ShadowsChunk.prototype.constructor = ShadowsChunk;

var AA = 0
ShadowsChunk.prototype.genCode = function( slots ){
  this.genCount = this.shadowCount;

  if( this.shadowCount > 0 ){
    slots.add( 'pf', shadPreCode( this ) );
  }

};


ShadowsChunk.prototype.addLight = function( light ){
  var i = this.shadowCount;
  this.shadowCount++;

  this._matrices       .set( light.getShadowProjection( this.lightSetup.bounds ), i*16*4 );
  this._texelBiasVector.set( light.getTexelBiasVector(),  i*4*2 );

  var s = light._shadowmapSize;
  this._shadowmapSizes[i*2+0] = s;
  this._shadowmapSizes[i*2+1] = 1.0/s;

  return i;
};


ShadowsChunk.prototype.getHash = function( ){
  return this.shadowCount;
};


ShadowsChunk.prototype.check = function( ){
  if( this.genCount !== this.shadowCount ){
    this._umatrices       = new Float32Array( this._matrices.buffer       , 0, this.shadowCount * 16 )
    this._utexelBiasVector= new Float32Array( this._texelBiasVector.buffer, 0, this.shadowCount * 4 )
    this._ushadowmapSizes = new Float32Array( this._shadowmapSizes.buffer , 0, this.shadowCount * 2 )
    this.invalidate();
  }
  this._invalid  = true;
};

ShadowsChunk.prototype.setup = function( prg ){

  if( this.shadowCount > 0 ){
    AA+= .01
    prg.uShadowMatrices        ( this._umatrices        );
    prg.uShadowTexelBiasVector ( this._utexelBiasVector );
    prg.uShadowMapSize         ( this._ushadowmapSizes );
    prg.uShadowKernelRotation  ( .5*Math.cos( AA ), .5*Math.sin( AA ) );
    this._invalid = false;
  }
};


// =================================
//          ABSTRACT LIGHT DATA
// =================================

function LightDatas(){
  Chunk.call( this, true, true );

  this.type = 0;
  this.lights = [];
  this.shadowIndices = [];
  this.preCodeTemplate = null;
}


LightDatas.prototype = Object.create( Chunk.prototype );
LightDatas.prototype.constructor = LightDatas;


LightDatas.prototype.addLight = function( l ){
  if( this.lights.indexOf( l ) === -1 ){
    this.lights.push( l );
    this.shadowIndices.push( -1 )
    this.invalidate();
  }
};


LightDatas.prototype.removeLight = function( l ){
  var i = this._lights.indexOf( l );
  if( i > -1 ){
    this.lights.splice( i, 1 );
    this.shadowIndices.splice( i, 1 );
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
    code += this.lights[i].genCode( i, this.shadowIndices[i] );
  }
  slots.add( 'lightsf', code );
};


LightDatas.prototype.getHash = function( ){
  var h = this.type+'';
  for (var i = 0; i < this.lights.length; i++) {
    h += -1; /// shadow?
  }
};


LightDatas.prototype.setup = function( prg ){
  for (var i = 0; i < this.shadowIndices.length; i++) {
    var si = this.shadowIndices[i]
    if( si > -1 ){
      prg[ 'tShadowMap'+si ]( this.lights[i]._fbo.color );
    }
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


SpotDatas.prototype.update = function( setup ){
  var lights = this.lights;
  this.allocate( lights.length);

  for (var i = 0; i < lights.length; i++) {
    var l = lights[i]
    this._directions.set( l._wdir,        i*3*4 )
    this._colors    .set( l._color,       i*3*4 )
    this._positions .set( l._wposition,   i*3*4 )
    this._spot      .set( l._spotData,    i*2*4 )
    this._falloff   .set( l._falloffData, i*3*4 )

    if( l._castShadows ){
      var shIndex = setup.shadowChunk.addLight( l );
      if( this.shadowIndices[i] !== shIndex ){
        this.invalidate();
      }
      this.shadowIndices[i] = shIndex;
    }
  }



  this._invalid  = true;
};


SpotDatas.prototype.setup = function( prg ){
  if( this.lights.length > 0 ){
    LightDatas.prototype.setup.call( this, prg );

    prg.uLSpotDirections( this._directions );
    prg.uLSpotColors    ( this._colors     );
    prg.uLSpotPositions ( this._positions  );
    prg.uLSpotSpot      ( this._spot       );
    prg.uLSpotFalloff   ( this._falloff    );

    this._invalid  = false;
  }
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

    if( l._castShadows ){
      var shIndex = setup.shadowChunk.addLight( l );
      if( this.shadowIndices[i] !== shIndex ){
        this.invalidate();
      }
      this.shadowIndices[i] = shIndex;
    }

  }

  this._invalid  = true;
};


DirDatas.prototype.setup = function( prg ){

  if( this.lights.length > 0 ){
    LightDatas.prototype.setup.call( this, prg );

    prg.uLDirDirections ( this._directions );
    prg.uLDirColors     ( this._colors     );
    this._invalid  = false;
  }
};



module.exports = LightSetup;
