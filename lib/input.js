
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

  this.name  = name;
  this.size  = size;
  this.param = null;
  this.comps = _trimComps( 'rgba', size );

  // code invalid
  this._maybeInvalid = true;
  this._genhash = '';

  // value/tex invalid
  this._invalid = true;
}



Input.prototype = {



  attach : function( param, comps ){
    this._maybeInvalid = true;
    this.param = param;
    if( comps === undefined ){
      comps = 'rgba';
    }
    this.comps = _trimComps( comps, this.size );
  },


  detach : function(){
    this.param = null;
    this._maybeInvalid = true;
  },


  attachSampler : function( name, texCoords, comps ){
    var p = new Sampler( name, texCoords );
    this.attach( p , comps );
    return p;
  },


  attachUniform : function( name, size, comps ){
    var p = new Uniform( name, size );
    this.attach( p , comps );
    return p;
  },


  attachAttribute : function( name, size, comps ){
    var p = new Sampler( name, size );
    this.attach( p , comps );
    return p;
  },


  attachConstant : function( value, comps ){
    var p = new Sampler( value );
    this.attach( p , comps );
    return p;
  },



  // ===================================================
  //
  //                 CODE GENERATION
  //
  // ===================================================

  genCode : function( chunks ){
    this._maybeInvalid = false;
    this._genhash = this._makeHash();

    if( this.param !== null ){

      this.genAvailable( chunks );

      var c = '#define '+this.name+'(k) '+this.param.token;
      if( this.param.size > 1 ) {
        c += '.' + this.comps;
      }
      chunks.pf += c;
    }

  },

  genAvailable : function( chunks ){
    var def = '#define HAS_'+this.name+' 1\n';
    chunks.pv += def;
    chunks.pf += def;
  },

  // return true if code has changed since last getCode()
  isDirty : function(){
    if( this._maybeInvalid ){
      var hash = this._makeHash()
      return hash !== this._genhash;
    }
    return false;
  },


  _stringifyValue : function(){
    var vals = []
    for (var i = 0; i < this.size; i++) {
      vals.push( this.value[i] );
    }
    return vals.join(',');
  },


  _setMode : function( mode ){
    if( this._mode !== mode ){
      this._maybeInvalid = true;
      this._mode = mode
    }
  },


  _makeHash : function(){
    var hash =
      this.size              +'/'+
      this.comps             +'/'+
      this.name              +'/'

    return hash;
  }


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
  this.name      = name;
  this.texCoords = texCoords;
  this._tex      = null;
  this.size      = 4;
  this._invalid  = true;

  this.token = 'VAL_'+this.name+this.texCoords;
}

Sampler.prototype = {

  set : function( t ){
    this._tex = t;
    this._invalid  = true;
  },

  genCode : function( chunks ){
    var name = this.name,
        tc   = this.texCoords,
        c;

    // PF
    c = 'uniform sampler2D ' + name + ';';
    c = _ndefWrap( c, ' DEF_' + name);
    chunks.pf += c;

    // F
    c = 'vec4 ' + this.token + ' = texture2D( '+name+', '+tc+');'
    c = _ndefWrap( c, ' CDE_' + name + tc );
    chunks.f += c;

  },

  _apply : function( prg ){
    prg[this.name]( this._tex );
    this._invalid  = false;
  },

  _makeHash : function(){
    return
      this.texCoord       +'/'+
      this.name;
  }

}


//                _  __
//               (_)/ _|
//    _   _ _ __  _| |_ ___  _ __ _ __ ___
//   | | | | '_ \| |  _/ _ \| '__| '_ ` _ \
//   | |_| | | | | | || (_) | |  | | | | | |
//    \__,_|_| |_|_|_| \___/|_|  |_| |_| |_|
//
//


function Uniform( name, size ){
  this.name = name;
  this.size = size;
  this._value = new Float32Array( size );
  this.token = this.name;
  this._invalid  = true;
}

Uniform.prototype = {

  set : function( ){
    for (var i = 0; i < arguments.length; i++) {
      this._value[i] = arguments[i]
    }
    this._invalid  = true;
  },

  genCode : function( chunks ){
    var c;

    // PF
    c = 'uniform ' + TYPES[this.size] + ' ' + this.token + ';';
    c = _ndefWrap( c, ' DEF_' + this.name);
    chunks.pf += c;

  },

  _apply : function( prg ){
    prg[this.name]( this._value );
    this._invalid  = false;
  },

  _makeHash : function(){
    return
      this.size       +'/'+
      this.name;
  }

}



//          _   _        _ _           _
//         | | | |      (_) |         | |
//     __ _| |_| |_ _ __ _| |__  _   _| |_ ___
//    / _` | __| __| '__| | '_ \| | | | __/ _ \
//   | (_| | |_| |_| |  | | |_) | |_| | ||  __/
//    \__,_|\__|\__|_|  |_|_.__/ \__,_|\__\___|
//
//

function Attribute( name, size ){
  this.name = name;
  this.size = size;
  this.token = 'v_'+this.name;
  this._invalid  = false;
}

Attribute.prototype = {

  set : function(){

  },

  genCode : function( chunks ){
    var c;

    // PF
    c = 'varying ' + TYPES[this.size] + ' ' + this.token + ';';
    c = _ndefWrap( c, ' DEF_' + this.name);
    chunks.pf += c;


    // PV
    c  = 'attribute ' + TYPES[this.size] + ' ' + this.name + ';\n  ';
    c += 'varying   ' + TYPES[this.size] + ' ' + this.token + ';';
    c  = _ndefWrap( c, ' DEF_' + this.name);
    chunks.pv += c;


    // V
    c = this.token + ' = ' + this.name + ';';
    c = _ndefWrap( c, ' CDE_' + this.name );
    chunks.v += c;

  },

  _apply : function( prg ){

  },

  _makeHash : function(){
    return
      this.size       +'/'+
      this.name;
  }

}


//                        _              _
//                       | |            | |
//     ___ ___  _ __  ___| |_ __ _ _ __ | |_
//    / __/ _ \| '_ \/ __| __/ _` | '_ \| __|
//   | (_| (_) | | | \__ \ || (_| | | | | |_
//    \___\___/|_| |_|___/\__\__,_|_| |_|\__|
//
//



function Constant( value ){
  this.name = 'CONST_'+(0|(Math.random()*0x7FFFFFFF)).toString(16);
  if( Array.isArray( value ) ){
    this.size = value.length;
  } else {
    this.size = 1;
  }
  this.value = value;
  this.token = 'VAR_'+this.name;
  this._invalid  = false;
}

Constant.prototype = {


  set : function( ){

  },


  genCode : function( chunks ){
    var c;

    // PF
    c = '#define '+this.token+' '+TYPES[this.size] + '(' + this._stringifyValue() +')'
    c = _ndefWrap( c, ' DEF_' + this.name);
    chunks.pf += c;

  },


  _apply : function( prg ){

  },


  _stringifyValue : function(){
    if( this.size === 1 ){
      return this.value.toString();
    } else {
      return this.value.map( _floatStr ).join( ',' );
    }
  },

  _makeHash : function(){
    return
      this._stringifyValue() + '/' +
      this.size       +'/'+
      this.name;
  }

}


Input.Sampler   = Sampler;
Input.Uniform   = Uniform;
Input.Attribute = Attribute;
Input.Constant  = Constant;

module.exports = Input;