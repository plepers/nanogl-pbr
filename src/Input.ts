import Texture2D from 'nanogl/texture-2d'

import Chunk from './Chunk'

import Swizzle from './Swizzle'
import ChunkSlots from './ChunksSlots'
import Program from 'nanogl/program'



const TYPES = [
  null,
  'float',
  'vec2',
  'vec3',
  'vec4'
] as const;


export enum ShaderType {
  FRAGMENT = 1,
  VERTEX = 2,
  ALL = FRAGMENT | VERTEX,
}


type InputSize = 1 | 2 | 3 | 4

/**
 * normalize swizzle string to match given vector size
 * eg :
 *   2 : rgba -> rg
 *   4 : rg   -> rggg
 *   3 : rgb  -> rgb
 */
function _trimComps(comps: Swizzle, size: InputSize): Swizzle {
  const l = comps.length;

  if (l === size) {
    return comps;
  }

  if (l > size) {
    return <Swizzle>comps.substr(0, size);
  }

  const last = comps[l - 1];
  while (comps.length < size) {
    comps = <Swizzle>(comps + last);
  }
  return comps;

}


function _floatStr(n: number) {
  return n.toPrecision(8);
}


function _addCode(slots: ChunkSlots, type: ShaderType, code: string) {
  if ((type & ShaderType.FRAGMENT) !== 0) {
    slots.add('f', code);
  }
  if ((type & ShaderType.VERTEX) !== 0) {
    slots.add('v', code);
  }
}


function _addPreCode(slots: ChunkSlots, type: ShaderType, code: string) {
  if ((type & ShaderType.FRAGMENT) !== 0) {
    slots.add('pf', code);
  }
  if ((type & ShaderType.VERTEX) !== 0) {
    slots.add('pv', code);
  }
}



// function genMacroDef(param: InputParam) {
//   var c = '#define ' + this.name + '(k) ' + param.token;
//   if (this.param.size > 1) {
//     c += '.' + this.comps;
//   }

//   _addPreCode(slots, this.shader, c);
// }




export interface IInputParam {

  name: string;
  size: InputSize;
  token: string;

  _input: Input | null;

}

type InputParam = IInputParam & Chunk;

//                              _
//                             | |
//    ___  __ _ _ __ ___  _ __ | | ___ _ __
//   / __|/ _` | '_ ` _ \| '_ \| |/ _ \ '__|
//   \__ \ (_| | | | | | | |_) | |  __/ |
//   |___/\__,_|_| |_| |_| .__/|_|\___|_|
//                       | |
//                       |_|


function isAttribute(x: string | Attribute): x is Attribute {
  return x instanceof Attribute;
}



export class Sampler extends Chunk implements IInputParam {

  name: string;
  size: InputSize;
  token: string;
  _input: Input | null;
  _tex: Texture2D | null;
  _linkAttrib: boolean;

  texCoords: string | Attribute;
  uvsToken: string;


  constructor(name: string, texCoords: Attribute | string) {

    super(true, true);

    this._input = null;
    this.name = name;
    this.texCoords = texCoords;
    this._tex = null;
    this.size = 4;


    if (isAttribute(texCoords)) {
      this._linkAttrib = true;
      this.addChild(texCoords);
      this.uvsToken = texCoords.token;
    } else {
      this._linkAttrib = false;
      this.uvsToken = texCoords;
    }

    this.token = `VAL_${this.name}${this.uvsToken}`;
  }



  set(t: Texture2D) {
    this._tex = t;
  }


  _genCode(slots: ChunkSlots) {
    if (this._input == null) return;

    var name = this.name,
      c;

    // PF
    c = `uniform sampler2D ${name};\n`;
    _addPreCode(slots, this._input.shader, c);
    // slots.add( 'pf', c );

    // F
    c = `vec4 ${this.token} = texture2D( ${name}, ${this.uvsToken});\n`;
    _addCode(slots, this._input.shader, c);
    // slots.add( 'f', c );

  }


  setup(prg: Program) {
    // sampler always invalid (unit can be changed by others)
    prg[this.name](this._tex);
  }


  _getHash() {
    return `${this._linkAttrib ? '' : this.texCoords}-${this.name}`;
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

export class Uniform extends Chunk implements IInputParam {

  name: string;
  size: InputSize;
  token: string;
  _input: Input | null;

  _value: Float32Array;

  constructor(name: string, size: InputSize) {

    super(true, true);

    this._input = null;
    this.name = name;
    this.size = size;
    this._value = new Float32Array(size);
    this.token = this.name;
  }





  set(...args: number[]) {
    for (var i = 0; i < args.length; i++) {
      this._value[i] = args[i];
    }
    this._invalid = true;
  }


  _genCode(slots: ChunkSlots) {
    if (this._input === null) return;
    var c;

    // PF
    c = `uniform ${TYPES[this.size]} ${this.token};\n`;
    _addPreCode(slots, this._input.shader, c);
    // slots.add( 'pf', c );

  }


  setup(prg: Program) {
    prg[this.name](this._value);
    this._invalid = false;
  }


  _getHash() {
    return `${this.size}-${this.name}`;
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


export class Attribute extends Chunk implements IInputParam {

  name: string;
  size: InputSize;
  token: string;
  _input: Input | null;

  constructor(name: string, size: InputSize) {
    super(true, false);

    this._input = null;
    this.name = name;
    this.size = size;
    this.token = `v_${this.name}`;
  }




  _genCode(slots: ChunkSlots) {

    var c;
    const typeId = TYPES[this.size];

    // PF
    c = `varying ${typeId} ${this.token};\n`;
    slots.add('pf', c);

    // PV
    c = `attribute ${typeId} ${this.name};\n`;
    c += `varying   ${typeId} ${this.token};\n`;
    slots.add('pv', c);

    // V
    c = `${this.token} = ${this.name};\n`;
    slots.add('v', c);

  }


  _getHash() {
    return `${this.size}-${this.name}`;
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



export class Constant extends Chunk implements IInputParam {

  name: string;
  size: InputSize;
  token: string;
  _input: Input | null;
  value: ArrayLike<number> | number;

  constructor(value: ArrayLike<number> | number) {
    super(true, false);

    this._input = null;

    this.name = `CONST_${(0 | (Math.random() * 0x7FFFFFFF)).toString(16)}`;
    if ( typeof value === 'number' ) {
      this.size = 1;
      this.value = value;
    } else {
      this.size = <InputSize>value.length;
      this.value = Array.from(value);
    }
    this.token = `VAR_${this.name}`;
  }



  _genCode(slots: ChunkSlots) {
    if (this._input === null) return;
    var c;

    // PF
    c = `#define ${this.token} ${TYPES[this.size]}(${this._stringifyValue()})\n`;
    _addPreCode(slots, this._input.shader, c);
    // slots.add( 'pf', c );

  }


  _stringifyValue() {
    if (this.size === 1) {
      return this.value.toString();
    } else {
      const a = <number[]>this.value;
      return a.map(_floatStr).join(',');
    }
  }


  _getHash() {
    return `${this._stringifyValue()}-${this.size}-`;
  }

}



export default class Input extends Chunk {


  static readonly Sampler = Sampler;
  static readonly Uniform = Uniform;
  static readonly Attribute = Attribute;
  static readonly Constant = Constant;

  static readonly FRAGMENT = ShaderType.FRAGMENT;
  static readonly VERTEX = ShaderType.VERTEX;
  static readonly ALL = ShaderType.ALL;


  readonly name : string;
  readonly size : InputSize;
  readonly shader: ShaderType;

  comps: Swizzle;
  param: InputParam | null;

  constructor(name: string, size: InputSize, shader: ShaderType = ShaderType.FRAGMENT) {

    super(true, false);

    this.name = name;
    this.size = size;
    this.param = null;
    this.comps = _trimComps('rgba', size);
    this.shader = shader;
  }







  attach(param: InputParam, comps: Swizzle = 'rgba') {
    if (this.param) {
      this.param._input = null;
      this.removeChild(this.param);
    }
    param._input = this;
    this.param = param;
    this.comps = _trimComps(comps, this.size);
    this.addChild(param);
  }


  detach() {
    if (this.param !== null) {
      this.param._input = null;
      this.removeChild(this.param);
    }
    this.param = null;
  }


  attachSampler(name: string, texCoords: string, comps: Swizzle = 'rgba') {
    var p = new Sampler(name, texCoords);
    this.attach(p, comps);
    return p;
  }


  attachUniform(name: string, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    var p = new Uniform(name, size);
    this.attach(p, comps);
    return p;
  }


  attachAttribute(name: string, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    var p = new Attribute(name, size);
    this.attach(p, comps);
    return p;
  }


  attachConstant(value: ArrayLike<number> | number, comps: Swizzle = 'rgba') {
    var p = new Constant(value);
    this.attach(p, comps);
    return p;
  }



  // ===================================================
  //
  //                 CODE GENERATION
  //
  // ===================================================


  _getHash(): string {
    var hash = `${this.size}-${this.comps}-${this.name}`;

    return hash;
  }


  _genCode(slots: ChunkSlots) {

    this.genAvailable(slots);

    if (this.param !== null) {

      var c = `#define ${this.name}(k) ${this.param.token}`;
      if (this.param.size > 1) {
        c += `.${this.comps}`;
      }

      _addPreCode(slots, this.shader, c);

    }

  }



  genAvailable(slots: ChunkSlots) {
    const val = (this.param === null) ? '0' : '1';
    const def = `#define HAS_${this.name} ${val}\n`;

    slots.add('definitions', def);

  }

}
