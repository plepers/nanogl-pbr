
var Chunk = require( './chunk' );


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


var FRAGMENT = 1,
    VERTEX   = 2;


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


function _floatStr( n ){
  return n.toPrecision( 8 );
}


function _addCode( slots, type, code ){
  if( ( type & FRAGMENT ) !== 0 ){
    slots.add( 'f', code );
  }
  if( ( type & VERTEX ) !== 0 ){
    slots.add( 'v', code );
  }
}


function _addPreCode( slots, type, code ){
  if( ( type & FRAGMENT ) !== 0 ){
    slots.add( 'pf', code );
  }
  if( ( type & VERTEX ) !== 0 ){
    slots.add( 'pv', code );
  }
}




function Input( name, size, shader ){

  Chunk.call( this, true, false);
  
  this.name   = name;
  this.size   = size;
  this.param  = null;
  this.comps  = _trimComps( 'rgba', size );
  this.shader = shader || FRAGMENT;
}


Input.prototype = Object.create( Chunk.prototype );
Input.prototype.constructor = Input;





Input.prototype.attach = function( param, comps ){
  if( this.param ){
    this.remove( this.param );
  }
  param._input = this;
  this.param = param;
  this.add( param );
  if( comps === undefined ){
    comps = 'rgba';
  }
  this.comps = _trimComps( comps, this.size );
};


Input.prototype.detach = function(){
  if( this.param ){
    this.param._input = null;
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


Input.prototype.genCode = function( slots ){

  this.genAvailable( slots );

  if( this.param !== null ){

    var c = '#define '+this.name+'(k) '+this.param.token;
    if( this.param.size > 1 ) {
      c += '.' + this.comps;
    }

    _addPreCode( slots, this.shader, c );
  }

};



Input.prototype.genAvailable = function( slots ){
  var val = (this.param === null) ? '0':'1';
  var def = '#define HAS_'+this.name+' '+ val +'\n';

  slots.add( 'pv', def );
  slots.add( 'pf', def );

};




function genMacroDef( param ){
  var c = '#define '+this.name+'(k) '+param.token;
  if( this.param.size > 1 ) {
    c += '.' + this.comps;
  }

  _addPreCode( slots, this.shader, c );
}


//                              _
//                             | |
//    ___  __ _ _ __ ___  _ __ | | ___ _ __
//   / __|/ _` | '_ ` _ \| '_ \| |/ _ \ '__|
//   \__ \ (_| | | | | | | |_) | |  __/ |
//   |___/\__,_|_| |_| |_| .__/|_|\___|_|
//                       | |
//                       |_|


function Sampler( name, texCoords ){

  Chunk.call( this, true, true );

  this._input    = null;
  this.name      = name;
  this.texCoords = texCoords;
  this._tex      = null;
  this.size      = 4;


  this._linkAttrib = texCoords instanceof Attribute;
  if( this._linkAttrib ){
    this.add( texCoords );
    this.uvsToken = this.texCoords.token;
  } else {
    this.uvsToken = this.texCoords;
  }

  this.token = 'VAL_'+this.name+this.uvsToken;
}


Sampler.prototype = Object.create( Chunk.prototype );
Sampler.prototype.constructor = Sampler;


Sampler.prototype.set = function( t ){
  this._tex = t;
};


Sampler.prototype.genCode = function( slots ){
  var name = this.name,
      c;

  // PF
  c = 'uniform sampler2D ' + name + ';\n';
  _addPreCode( slots, this._input.shader, c );
  // slots.add( 'pf', c );

  // F
  c = 'vec4 ' + this.token + ' = texture2D( '+name+', '+this.uvsToken+');\n';
  _addCode( slots, this._input.shader, c );
  // slots.add( 'f', c );

};


Sampler.prototype.setup = function( prg ){
  // sampler always invalid (unit can be changed by others)
  prg[this.name]( this._tex );
};


Sampler.prototype.getHash = function(){
  return ( this._linkAttrib ? '':this.texCoords ) +'-'+
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

  Chunk.call( this, true, true );

  this._input    = null;
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


Uniform.prototype.genCode = function( slots ){
  var c;

  // PF
  c = 'uniform ' + TYPES[this.size] + ' ' + this.token + ';\n';
  _addPreCode( slots, this._input.shader, c );
  // slots.add( 'pf', c );

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
  Chunk.call( this, true, false );

  this._input    = null;
  this.name = name;
  this.size = size;
  this.token = 'v_'+this.name;
}


Attribute.prototype = Object.create( Chunk.prototype );
Attribute.prototype.constructor = Attribute;


Attribute.prototype.genCode = function( slots ){
  var c;

  // PF
  c = 'varying ' + TYPES[this.size] + ' ' + this.token + ';\n';
  slots.add( 'pf', c );


  // PV
  c  = 'attribute ' + TYPES[this.size] + ' ' + this.name  + ';\n';
  c += 'varying   ' + TYPES[this.size] + ' ' + this.token + ';\n';
  slots.add( 'pv', c );


  // V
  c = this.token + ' = ' + this.name + ';\n';
  slots.add( 'v', c );

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
  Chunk.call( this, true, false );

  this._input    = null;

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


Constant.prototype.genCode = function( slots ){
  var c;

  // PF
  c = '#define '+this.token+' '+TYPES[this.size] + '(' + this._stringifyValue() +')\n';
  _addPreCode( slots, this._input.shader, c );
  // slots.add( 'pf', c );

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

Input.FRAGMENT  = FRAGMENT;
Input.VERTEX    = VERTEX;
Input.ALL       = VERTEX | FRAGMENT;

module.exports = Input;