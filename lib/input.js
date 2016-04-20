
var Chunk = require( './chunk' );
// Example
// -----------------
function example(){

  mat.roughness = new Input( 'roughness', 1 )
  mat.alpha     = new Input( 'alpha',     1 );
  mat.color     = new Input( 'color',     3 );


  mat.roughness.useSampler() // default to (  'r', 'roughness', 'vTexCoord0' )
  mat.roughness( .8 )

  var agt = new Input.Sampler( 'agtTex', 'vTexCoord0' )
  mat.roughness.attach( agt, 'g' )
  mat.alpha    .attach( agt, 'r' )
  agt.set( texture );

  mat.color    .useUniform() // default to ( 'rgb', 'color', 3 )
  mat.color( 1, 2, 3 )



  mat.color    .useUniform( 'rgb', 'acolor', 4 );
  mat.alpha    .useUniform( 'a',   'acolor', 4 );
  mat.acolor( [1, 1, 0, 1] );

}

// -----------------

var NONE_MODE     = 0,
    CONSTANT_MODE = 1,
    UNIFORM_MODE  = 2,
    SAMPLER_MODE  = 3,
    ATTRIB_MODE   = 4;


var DECL_TYPES = [
  '', '',
  'uniform',
  'uniform',
  'attribute'
];

var TYPES = [
  null,
  'float',
  'vec2',
  'vec3',
  'vec4'
];

/**
 * normalize swizzle string to match given vector size
 * eg :
 *   2 : rgba -> rg
 *   4 : rg   -> rggg
 *   3 : rgb  -> rgb
 */
function _trimComps( comps, size ){
  var l = comps.length;

  if( l === size ){
    return comps;
  }

  if( l > size ){
    return comps.substr( 0, size );
  }

  var last = comps[l-1];
  while( comps.length < size ){
    comps = comps+last;
  }
  return comps;

}

/**
 * wrap code in ndef condition
 */
function _ndefWrap( str, def ){
  return  '#ifndef '+def+'\n  #define '+def+' 1\n  '+
            str+
          '\n#endif\n';
}


function _floatStr( n ){
  return n.toPrecision( 8 );
}


function Input( name, size ){
  Chunk.call( this, true, false)
  this.name  = name;
  this.size  = size;
  this.param = null;
  this.comps = _trimComps( 'rgba', size );
}


Input.prototype = Object.create( Chunk.prototype );
Input.prototype.constructor = Input;





Input.prototype.attach = function( param, comps ){
  if( this.param ){
    this.remove( this.param );
  }
  this.param = param;
  this.add( param );
  if( comps === undefined ){
    comps = 'rgba';
  }
  this.comps = _trimComps( comps, this.size );
};


Input.prototype.detach = function(){
  if( this.param ){
    this.remove( this.param );
  }
  this.param = null;
};


Input.prototype.attachSampler = function( name, texCoords, comps ){
  var p = new Sampler( name, texCoords );
  this.attach( p , comps );
  return p;
};


Input.prototype.attachUniform = function( name, size, comps ){
  var p = new Uniform( name, size || this.size );
  this.attach( p , comps );
  return p;
};


Input.prototype.attachAttribute = function( name, size, comps ){
  var p = new Attribute( name, size || this.size );
  this.attach( p , comps );
  return p;
};


Input.prototype.attachConstant = function( value, comps ){
  var p = new Constant( value );
  this.attach( p , comps );
  return p;
};



// ===================================================
//
//                 CODE GENERATION
//
// ===================================================


Input.prototype.getHash = function(){
  var hash = this.size              +'-'+
             this.comps             +'-'+
             this.name;

  return hash;
};


Input.prototype.genCode = function( chunks ){

  this.genAvailable( chunks );

  if( this.param !== null ){

    var c = '#define '+this.name+'(k) '+this.param.token;
    if( this.param.size > 1 ) {
      c += '.' + this.comps;
    }
    chunks.pf += c+'\n';
  }

};


Input.prototype.genAvailable = function( chunks ){
  var val = (this.param === null) ? '0':'1';
  var def = '#define HAS_'+this.name+' '+ val +'\n';
  chunks.pv += def;
  chunks.pf += def;
};




//                              _
//                             | |
//    ___  __ _ _ __ ___  _ __ | | ___ _ __
//   / __|/ _` | '_ ` _ \| '_ \| |/ _ \ '__|
//   \__ \ (_| | | | | | | |_) | |  __/ |
//   |___/\__,_|_| |_| |_| .__/|_|\___|_|
//                       | |
//                       |_|


function Sampler( name, texCoords ){

  Chunk.call( this, true, true )

  this.name      = name;
  this.texCoords = texCoords;
  this._tex      = null;
  this.size      = 4;

  this.token = 'VAL_'+this.name+this.texCoords;
}


Sampler.prototype = Object.create( Chunk.prototype );
Sampler.prototype.constructor = Sampler;


Sampler.prototype.set = function( t ){
  this._tex = t;
};


Sampler.prototype.genCode = function( chunks ){
  var name = this.name,
      tc   = this.texCoords,
      c;

  // PF
  c = 'uniform sampler2D ' + name + ';\n';
  // c = _ndefWrap( c, ' DEF_' + name);
  chunks.pf += c;

  // F
  c = 'vec4 ' + this.token + ' = texture2D( '+name+', '+tc+');\n'
  // c = _ndefWrap( c, ' CDE_' + name + tc );
  chunks.f += c;

};


Sampler.prototype.setup = function( prg ){
  // sampler always invalid (unit can be changed by others)
  prg[this.name]( this._tex );
};


Sampler.prototype.getHash = function(){
  return this.texCoords       +'-'+
         this.name;
};



//                _  __
//               (_)/ _|
//    _   _ _ __  _| |_ ___  _ __ _ __ ___
//   | | | | '_ \| |  _/ _ \| '__| '_ ` _ \
//   | |_| | | | | | || (_) | |  | | | | | |
//    \__,_|_| |_|_|_| \___/|_|  |_| |_| |_|
//
//


function Uniform( name, size ){

  Chunk.call( this, true, true )

  this.name = name;
  this.size = size;
  this._value = new Float32Array( size );
  this.token = this.name;
}


Uniform.prototype = Object.create( Chunk.prototype );
Uniform.prototype.constructor = Uniform;



Uniform.prototype.set = function( ){
  for (var i = 0; i < arguments.length; i++) {
    this._value[i] = arguments[i];
  }
  this._invalid  = true;
};


Uniform.prototype.genCode = function( chunks ){
  var c;

  // PF
  c = 'uniform ' + TYPES[this.size] + ' ' + this.token + ';\n';
  // c = _ndefWrap( c, ' DEF_' + this.name);
  chunks.pf += c;

};


Uniform.prototype.setup = function( prg ){
  prg[this.name]( this._value );
  this._invalid  = false;
};


Uniform.prototype.getHash = function(){
  return this.size       +'-'+
         this.name;
};




//          _   _        _ _           _
//         | | | |      (_) |         | |
//     __ _| |_| |_ _ __ _| |__  _   _| |_ ___
//    / _` | __| __| '__| | '_ \| | | | __/ _ \
//   | (_| | |_| |_| |  | | |_) | |_| | ||  __/
//    \__,_|\__|\__|_|  |_|_.__/ \__,_|\__\___|
//
//

function Attribute( name, size ){
  Chunk.call( this, true, false )

  this.name = name;
  this.size = size;
  this.token = 'v_'+this.name;
}


Attribute.prototype = Object.create( Chunk.prototype );
Attribute.prototype.constructor = Attribute;


Attribute.prototype.genCode = function( chunks ){
  var c;

  // PF
  c = 'varying ' + TYPES[this.size] + ' ' + this.token + ';\n';
  // c = _ndefWrap( c, ' DEF_' + this.name);
  chunks.pf += c;


  // PV
  c  = 'attribute ' + TYPES[this.size] + ' ' + this.name  + ';\n';
  c += 'varying   ' + TYPES[this.size] + ' ' + this.token + ';\n';
  // c  = _ndefWrap( c, ' DEF_' + this.name);
  chunks.pv += c;


  // V
  c = this.token + ' = ' + this.name + ';\n';
  // c = _ndefWrap( c, ' CDE_' + this.name );
  chunks.v += c;

};


Attribute.prototype.getHash = function(){
  return this.size       +'-'+
         this.name;
};


//                        _              _
//                       | |            | |
//     ___ ___  _ __  ___| |_ __ _ _ __ | |_
//    / __/ _ \| '_ \/ __| __/ _` | '_ \| __|
//   | (_| (_) | | | \__ \ || (_| | | | | |_
//    \___\___/|_| |_|___/\__\__,_|_| |_|\__|
//
//



function Constant( value ){
  Chunk.call( this, true, false )

  this.name = 'CONST_'+(0|(Math.random()*0x7FFFFFFF)).toString(16);
  if( Array.isArray( value ) ){
    this.size = value.length;
  } else {
    this.size = 1;
  }
  this.value = value;
  this.token = 'VAR_'+this.name;
}


Constant.prototype = Object.create( Chunk.prototype );
Constant.prototype.constructor = Constant;


Constant.prototype.genCode = function( chunks ){
  var c;

  // PF
  c = '#define '+this.token+' '+TYPES[this.size] + '(' + this._stringifyValue() +')\n'
  // c = _ndefWrap( c, ' DEF_' + this.name);
  chunks.pf += c;

};


Constant.prototype._stringifyValue = function(){
  if( this.size === 1 ){
    return this.value.toString();
  } else {
    return this.value.map( _floatStr ).join( ',' );
  }
};


Constant.prototype.getHash = function(){
  return this._stringifyValue() + '-' +
         this.size       +'-'+
         this.name;
};



Input.Sampler   = Sampler;
Input.Uniform   = Uniform;
Input.Attribute = Attribute;
Input.Constant  = Constant;

module.exports = Input;