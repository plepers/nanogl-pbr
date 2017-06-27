var Light  = require( './light' );
var Chunk  = require( '../chunk' );
var Enum   = require( '../enum' );
var Flag   = require( '../flag' );

var dirPreCode    = require( '../../glsl/templates/standard/directional-lights-pre.frag' );
var spotPreCode   = require( '../../glsl/templates/standard/spot-lights-pre.frag' );
var pointPreCode  = require( '../../glsl/templates/standard/point-lights-pre.frag' );

var dirLightCode  = require( '../../glsl/templates/standard/directional-light.frag' );
var spotLightCode = require( '../../glsl/templates/standard/spot-light.frag' );
var pointLightCode= require( '../../glsl/templates/standard/point-light.frag' );

var shadPreCode   = require( '../../glsl/templates/standard/shadow-maps-pre.frag' );
var preLightCode  = require( '../../glsl/templates/standard/pre-light-setup.frag' );
var postLightCode = require( '../../glsl/templates/standard/post-light-setup.frag' );



// =================================
//          Light Model
// =================================


function StandardModel(){

  this._datas = {}
  this._dataList = []
  this._setup = null;

  var d;

  this.preLightsChunk   = new PreLightsChunk();
  this.postLightsChunk  = new PostLightsChunk();
  this.shadowChunk      = new ShadowsChunk( this );

  this.shadowFilter = new Enum( 'shadowFilter',[
    'PCFNONE',
    'PCF4x1',
    'PCF4x4',
    'PCF2x2'
  ]);



  // damp renv reflexion for shadowed pixel
  this.iblShadowing = new Flag( 'iblShadowing', false);

  
  d = new DirDatas()
  this._datas[Light.TYPE_DIR] = d;
  this._dataList.push( d );

  d = new SpotDatas()
  this._datas[Light.TYPE_SPOT] = d;
  this._dataList.push( d );

  d = new PointDatas()
  this._datas[Light.TYPE_POINT] = d;
  this._dataList.push( d );

}


StandardModel.prototype = {


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
      this._dataList[i].update( this );
    }

    this.shadowChunk.check();

  },

  getChunks : function(){
    var res = [];

    res.push( this.iblShadowing.createProxy() );
    res.push( this.shadowFilter.createProxy() );
    res.push( this.shadowChunk .createProxy() );
    res.push( this.preLightsChunk .createProxy() );

    for (var i = 0; i < this._dataList.length; i++) {
      res.push( this._dataList[i].createProxy() );
    }

    res.push(    this.postLightsChunk .createProxy() );
    
    return res;
  }

}



// =================================
//          COMMON CHUNK
// =================================


function PreLightsChunk(){
  Chunk.call( this, true, false );
}


PreLightsChunk.prototype = Object.create( Chunk.prototype );
PreLightsChunk.prototype.constructor = PreLightsChunk;

PreLightsChunk.prototype.genCode = function( slots ){
  code = preLightCode( this )
  slots.add( 'lightsf', code );
};


PreLightsChunk.prototype.getHash = function( ){
  return '0';
};


// =================================
//          POST LIGHT CHUNK
// =================================


function PostLightsChunk(){
  Chunk.call( this, true, false );
}


PostLightsChunk.prototype = Object.create( Chunk.prototype );
PostLightsChunk.prototype.constructor = PostLightsChunk;

PostLightsChunk.prototype.genCode = function( slots ){
  code = postLightCode( this )
  slots.add( 'lightsf', code );
};


PostLightsChunk.prototype.getHash = function( ){
  return '0';
};



// =================================
//          SHADOWS CHUNK
// =================================

var MAX_SHADOWS = 4;


function ShadowsChunk( lightModel ){
  Chunk.call( this, true, true );
  this.lightModel       = lightModel;
  this.shadowCount      = 0;
  this.genCount         = 0;
  this._matrices        = new Float32Array( MAX_SHADOWS * 16 );
  this._texelBiasVector = new Float32Array( MAX_SHADOWS * 4 );
  this._shadowmapSizes  = new Float32Array( MAX_SHADOWS * 2 );
  this._umatrices       = null;
  this._utexelBiasVector= null;
  this._ushadowmapSizes= null;
}


ShadowsChunk.prototype = Object.create( Chunk.prototype );
ShadowsChunk.prototype.constructor = ShadowsChunk;

var AA = Math.PI/4
ShadowsChunk.prototype.genCode = function( slots ){

  if( this.shadowCount > 0 ){
    slots.add( 'pf', shadPreCode( this ) );
  }

};


ShadowsChunk.prototype.addLight = function( light ){
  var i = this.shadowCount;
  this.shadowCount++;

  this._matrices       .set( light.getShadowProjection( this.lightModel._setup.bounds ), i*16 );
  this._texelBiasVector.set( light.getTexelBiasVector(),  i*4 );

  var s = light._shadowmapSize;
  this._shadowmapSizes[i*2+0] = s;
  this._shadowmapSizes[i*2+1] = 1.0/s;

  if( i===0 ){
    var hasDepthTex = light.hasDepthShadowmap();
    this.lightModel._setup.depthFormat.set( hasDepthTex ? 'D_DEPTH' : 'D_RGB' );
  }

  return i;
};


ShadowsChunk.prototype.getHash = function( ){
  return this.shadowCount;
};


ShadowsChunk.prototype.check = function( ){
  if( this.genCount !== this.shadowCount ){
    this.genCount = this.shadowCount;
    this._umatrices       = new Float32Array( this._matrices.buffer       , 0, this.shadowCount * 16 )
    this._utexelBiasVector= new Float32Array( this._texelBiasVector.buffer, 0, this.shadowCount * 4 )
    this._ushadowmapSizes = new Float32Array( this._shadowmapSizes.buffer , 0, this.shadowCount * 2 )
    this.invalidate();
  }
  this._invalid  = true;
};

ShadowsChunk.prototype.setup = function( prg ){

  if( this.shadowCount > 0 ){
    // AA+= .01
    prg.uShadowMatrices        ( this._umatrices        );
    prg.uShadowTexelBiasVector ( this._utexelBiasVector );
    prg.uShadowMapSize         ( this._ushadowmapSizes );
    // not used in NO_FILTER
    if( prg.uShadowKernelRotation !== undefined ){
      prg.uShadowKernelRotation  ( 1.0*Math.cos( AA ), 1.0*Math.sin( AA ) );
    }
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
  var i = this. lights.indexOf( l );
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
    code += this.genCodePerLights( this.lights[i], i, this.shadowIndices[i] );
  }



  slots.add( 'lightsf', code );
};


LightDatas.prototype.genCodePerLights = function( light, index, shadowIndex ){
  // abstract
};



LightDatas.prototype.getHash = function( ){
  var h = this.type+''+this.lights.length;
  for (var i = 0; i < this.lights.length; i++) {
    if( this.lights[i]._castShadows ) {
      h += i;
    }
  }
  return h;
};


LightDatas.prototype.setup = function( prg ){
  for (var i = 0; i < this.shadowIndices.length; i++) {
    var si = this.shadowIndices[i]
    if( si > -1 ){
      var tex = this.lights[i].getShadowmap();
      prg[ 'tShadowMap'+si ]( tex );
    }
  }
};



// =================================
//               SPOTS
// =================================

function SpotDatas(){
  LightDatas.call( this );

  this.type = Light.TYPE_SPOT;
  this._directions = null;
  this._colors     = null;
  this._positions  = null;
  this._spot       = null;
  this._falloff    = null;

  this.preCodeTemplate = spotPreCode;
}


SpotDatas.prototype = Object.create( LightDatas.prototype );
SpotDatas.prototype.constructor = SpotDatas;



SpotDatas.prototype.genCodePerLights = function( light, index, shadowIndex ){
  var o = {
    index : index,
    shadowIndex : shadowIndex
  };
  return spotLightCode( o );
};

SpotDatas.prototype.allocate = function( n ){

  if( this._colors === null || this._colors.length/4 !== n ){
    this._directions = new Float32Array( n * 3 );
    this._colors     = new Float32Array( n * 4 );
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
    this._directions.set( l._wdir,        i*3 )
    this._colors    .set( l._color,       i*4 )
    this._positions .set( l._wposition,   i*3 )
    this._spot      .set( l._spotData,    i*2 )
    this._falloff   .set( l._falloffData, i*3 )

    this._colors[i*4+3] = l.iblShadowing;

    if( l._castShadows ){
      var shIndex = setup.shadowChunk.addLight( l );
      if( this.shadowIndices[i] !== shIndex ){
        this.invalidate();
      }
      this.shadowIndices[i] = shIndex;
    } else {
      this.shadowIndices[i] = -1;
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

  this.type = Light.TYPE_DIR;
  this._directions = null;
  this._colors     = null;
  this.preCodeTemplate = dirPreCode;
}



DirDatas.prototype = Object.create( LightDatas.prototype );
DirDatas.prototype.constructor = DirDatas;


DirDatas.prototype.genCodePerLights = function( light, index, shadowIndex ){
  var o = {
    index : index,
    shadowIndex : shadowIndex
  };
  return dirLightCode( o );
};


DirDatas.prototype.allocate = function( n ){

  if( this._colors === null || this._colors.length/4 !== n ){
    this._directions = new Float32Array( n * 3 );
    this._colors     = new Float32Array( n * 4 );
  }
};


DirDatas.prototype.update = function( setup ){
  var lights = this.lights;
  this.allocate( lights.length);

  for (var i = 0; i < lights.length; i++) {
    var l = lights[i]
    this._directions.set( l._wdir,  i*3 )
    this._colors    .set( l._color, i*4 )
    this._colors[i*4+3] = l.iblShadowing;

    if( l._castShadows ){
      var shIndex = setup.shadowChunk.addLight( l );
      if( this.shadowIndices[i] !== shIndex ){
        this.invalidate();
      }
      this.shadowIndices[i] = shIndex;
    } else {
      this.shadowIndices[i] = -1;
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






// =================================
//               POINT
// =================================


function PointDatas(){
  LightDatas.call( this );

  this.type = Light.TYPE_POINT;
  this._colors     = null;
  this._positions  = null;
  this._falloff    = null;

  this.preCodeTemplate = pointPreCode;
}


PointDatas.prototype = Object.create( LightDatas.prototype );
PointDatas.prototype.constructor = PointDatas;



PointDatas.prototype.genCodePerLights = function( light, index, shadowIndex ){
  var o = {
    index : index,
    shadowIndex : shadowIndex
  };
  return pointLightCode( o );
};

PointDatas.prototype.allocate = function( n ){

  if( this._colors === null || this._colors.length/3 !== n ){
    this._colors     = new Float32Array( n * 3 );
    this._positions  = new Float32Array( n * 3 );
    this._falloff    = new Float32Array( n * 3 );
  }
};


PointDatas.prototype.update = function( setup ){
  var lights = this.lights;
  this.allocate( lights.length);

  for (var i = 0; i < lights.length; i++) {
    var l = lights[i]
    this._colors    .set( l._color,       i*3 )
    this._positions .set( l._wposition,   i*3 )
    this._falloff   .set( l._falloffData, i*3 )

    // this._colors[i*4+3] = l.iblShadowing;

    if( l._castShadows ){
      var shIndex = setup.shadowChunk.addLight( l );
      if( this.shadowIndices[i] !== shIndex ){
        this.invalidate();
      }
      this.shadowIndices[i] = shIndex;
    } else {
      this.shadowIndices[i] = -1;
    }
  }

  this._invalid  = true;
};


PointDatas.prototype.setup = function( prg ){
  if( this.lights.length > 0 ){
    LightDatas.prototype.setup.call( this, prg );

    prg.uLPointColors    ( this._colors     );
    prg.uLPointPositions ( this._positions  );
    prg.uLPointFalloff   ( this._falloff    );

    this._invalid  = false;
  }
};


module.exports = StandardModel;