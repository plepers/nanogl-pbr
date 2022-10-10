import Texture2D from 'nanogl/texture-2d'

import Chunk from './Chunk'

import Swizzle from './Swizzle'
import ChunksSlots from './ChunksSlots'
import Program from 'nanogl/program'
import { hashString, Hash, stringifyHash } from './Hash'
import TexCoord from './TexCoord'
import { ColorSpace } from './ColorSpace'



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


function _addCode(slots: ChunksSlots, type: ShaderType, code: string) {
  if ((type & ShaderType.FRAGMENT) !== 0) {
    slots.add('f', code);
  }
  if ((type & ShaderType.VERTEX) !== 0) {
    slots.add('v', code);
  }
}


function _addPreCode(slots: ChunksSlots, type: ShaderType, code: string) {
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


enum ParamType {
  SAMPLER,
  UNIFORM,
  ATTRIBUTE,
  CONSTANT,
}



export interface IInputParam {
  readonly ptype : ParamType;
  name: string;
  size: InputSize;
  token: string;

  genInputCode(slots: ChunksSlots, input: Input):void;

}

type InputParam = Sampler | Uniform | Attribute | Constant;




export abstract class BaseParams extends Chunk {
    
  protected _colorspace: ColorSpace = ColorSpace.AUTO;

  constructor(hasCode: boolean = false, hasSetup: boolean = false) {
    super(hasCode, hasSetup);
  }
  

  set colorspace( c : ColorSpace ) {
    if( this._colorspace !== c ) {
      this._colorspace = c;
      this.invalidateCode();
    }
  }

  get colorspace() {
    return this._colorspace;
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




export class Sampler extends BaseParams implements IInputParam {

  readonly ptype : ParamType.SAMPLER = ParamType.SAMPLER

  name: string;
  size: InputSize;
  token: string;
  _tex: Texture2D | null;

  texCoords: TexCoord | string;
  _varying : string;


  constructor(name: string, texCoords: TexCoord | string = TexCoord.create(), colorspace : ColorSpace = ColorSpace.AUTO) {

    super(true, true);

    this.name = name;
    this._tex = null;
    this.size = 4;
    this._colorspace = colorspace;
    
    if( typeof texCoords === 'string' ){
      this.texCoords = texCoords;
      this._varying = texCoords;
    } else {
      this.texCoords = texCoords;
      this.addChild( this.texCoords );
      this._varying = texCoords.varying();
    }
    this.token = `VAL_${this.name}${this._varying}`;
  }



  set(t: Texture2D) {
    this._tex = t;
  }

  protected _genCode(slots: ChunksSlots): void {}

  genInputCode(slots: ChunksSlots, input:Input) {

    let c;

    // PF
    c = `uniform sampler2D ${this.name};\n`;
    _addPreCode(slots, input.shader, c);

    // F
    c = `vec4 ${this.token} = texture2D( ${this.name}, ${this._varying});\n`;
    c += Sampler.colorSpaceTransformCode( this._colorspace, input.colorspace, `${this.token}.rgb`);
    _addCode(slots, input.shader, c);

  }


  setup(prg: Program) {
    // sampler always invalid (unit can be changed by others)
    prg[this.name](this._tex);
  }

  private static colorSpaceTransformCode( from : ColorSpace, to : ColorSpace, v : string ) : string {
    if( from === ColorSpace.LINEAR && to === ColorSpace.SRGB ){
      return `${v} = sqrt(${v});`;
    }
    if( from === ColorSpace.SRGB && to === ColorSpace.LINEAR ){
      return `${v} = ${v}*${v};`;
    }
    return '';
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

export class Uniform extends BaseParams implements IInputParam {

  readonly ptype : ParamType.UNIFORM = ParamType.UNIFORM
  
  readonly name: string;
  readonly size: InputSize;
  token: string;


  private _value: Float32Array

  public get value(): Float32Array {
    return this._value
  }
  
  public set x(v: number) {this._value[0] = v}
  public set y(v: number) {this._value[1] = v}
  public set z(v: number) {this._value[2] = v}
  public set w(v: number) {this._value[3] = v}

  public get x(): number {return this._value[0]}
  public get y(): number {return this._value[1]}
  public get z(): number {return this._value[2]}
  public get w(): number {return this._value[3]}


  constructor(name: string, size: InputSize) {

    super(true, true);

    this.name = name;
    this.size = size;
    this._value = new Float32Array(size);
    this.token = 'VAL_'+this.name;
  }





  set(...args: number[]) {
    for (var i = 0; i < args.length; i++) {
      this._value[i] = args[i];
    }
    this._invalid = true;
  }


  protected _genCode(slots: ChunksSlots): void {}

  genInputCode(slots: ChunksSlots, input: Input) {
    // PF
    let c = `uniform ${TYPES[this.size]} ${this.name};\n`;
    c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, this.name)
    _addPreCode(slots, input.shader, c);
    // slots.add( 'pf', c );

  }


  setup(prg: Program) {
    prg[this.name](this._value);
    this._invalid = false;
  }


  static colorSpaceTransformCode( from : ColorSpace, to : ColorSpace, d : string, v : string ) : string {
    if( from === ColorSpace.LINEAR && to === ColorSpace.SRGB ){
      return `#define ${d} sqrt(${v})`;
    }
    if( from === ColorSpace.SRGB && to === ColorSpace.LINEAR ){
      return `#define ${d} (${v}*${v})`;
    }
    return `#define ${d} ${v}`;
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


export class Attribute extends BaseParams implements IInputParam {

  readonly ptype : ParamType.ATTRIBUTE = ParamType.ATTRIBUTE
  
  name: string;
  size: InputSize;
  token: string;

  constructor(name: string, size: InputSize) {
    super(true, false);

    this.name = name;
    this.size = size;
    this.token = `v_${this.name}`;
  }




  protected _genCode(slots: ChunksSlots): void {}

  genInputCode(slots: ChunksSlots, input: Input) {
    
    var c;
    const typeId = TYPES[this.size];

    // PF
    c = `IN ${typeId} ${this.token};\n`;
    slots.add('pf', c);

    // PV
    c = `IN ${typeId} ${this.name};\n`;
    c += `OUT ${typeId} ${this.token};\n`;
    slots.add('pv', c);

    // V
    c = `${this.token} = ${this.name};\n`;
    slots.add('v', c);

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



export class Constant extends BaseParams implements IInputParam {

  readonly ptype : ParamType.CONSTANT = ParamType.CONSTANT
  
  name: string = '';
  size: InputSize = 1;
  token: string = '';
  value: ArrayLike<number> | number = 0;
  _hash: Hash = 0

  constructor(value: ArrayLike<number> | number) {
    super(true, false);
    this.set( value )
  }

  set( value: ArrayLike<number> | number) {
    
    if ( typeof value === 'number' ) {
      this.size = 1;
      this.value = value;
    } else {
      this.size = <InputSize>value.length;
      this.value = Array.from(value);
    }

    const hash = this._hash
    this._hash = hashString( `${this.size}-${this.name}-${this._stringifyValue()}` )
    this.name = `CONST_${stringifyHash( this._hash )}`;
    this.token = `VAR_${this.name}`;

    if( hash !== this._hash ){
      this.invalidateCode()
    }
  }

  protected _genCode(slots: ChunksSlots): void {}

  genInputCode(slots: ChunksSlots, input: Input) {
    let c = `#define RAW_${this.token} ${TYPES[this.size]}(${this._stringifyValue()})\n`;
    c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, 'RAW_'+this.token)
    _addPreCode(slots, input.shader, c );
  }


  _stringifyValue() {
    if (this.size === 1) {
      return this.value.toString();
    } else {
      const a = <number[]>this.value;
      return a.map(_floatStr).join(',');
    }
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

  private _colorspace: ColorSpace = ColorSpace.LINEAR;

  comps: Swizzle;
  param: InputParam | null;
  


  constructor(name: string, size: InputSize, shader: ShaderType = ShaderType.FRAGMENT, colorspace: ColorSpace = ColorSpace.LINEAR) {

    super(true, false);

    this.name = name;
    this.size = size;
    this.param = null;
    this.comps = _trimComps('rgba', size);
    this.shader = shader;
    this.colorspace = colorspace;

  }

  /**
   * The colorspace of the input's value as is should be decoded.
   * To set the actual value in textures, set the colorspace property of the attached sampler
   */
  set colorspace( c : ColorSpace ) {
    if( this._colorspace !== c ) {
      this._colorspace = c;
      this.invalidateCode();
    }
  }

  get colorspace() {
    return this._colorspace;
  }



  attach(param: InputParam, comps: Swizzle = 'rgba') {
    if (this.param) {
      this.removeChild(this.param);
    }
    this.param = param;
    this.comps = _trimComps(comps, this.size);
    this.addChild(param);
  }


  detach() {
    if (this.param !== null) {
      this.removeChild(this.param);
    }
    this.param = null;
  }


  attachSampler(name: string = `T${this.name}`, texCoords: string | TexCoord= TexCoord.create(), comps: Swizzle = 'rgba') {
    const p = new Sampler(name, texCoords);
    this.attach(p, comps);
    return p;
  }


  attachUniform(name: string = `U${this.name}`, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    const p = new Uniform(name, size);
    this.attach(p, comps);
    return p;
  }


  attachAttribute(name: string = `A${this.name}`, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    const p = new Attribute(name, size);
    this.attach(p, comps);
    return p;
  }


  attachConstant(value: ArrayLike<number> | number, comps: Swizzle = 'rgba') {
    const p = new Constant(value);
    this.attach(p, comps);
    return p;
  }



  // ===================================================
  //
  //                 CODE GENERATION
  //
  // ===================================================



  _genCode(slots: ChunksSlots) {

    this.param?.genInputCode(slots, this);

    const val = (this.param === null) ? '0' : '1';
    const def = `#define HAS_${this.name} ${val}\n`;
    slots.add('definitions', def );

    if (this.param !== null) {

      var c = `#define ${this.name}(k) ${this.param.token}`;
      if (this.param.size > 1) {
        c += `.${this.comps}`;
      }
      
      _addPreCode(slots, this.shader, c);
      
      if( this.param.ptype === ParamType.SAMPLER ){
        var c = `#define ${this.name}_texCoord(k) ${this.param._varying}`;
        _addPreCode(slots, this.shader, c);
      }
    }


  }


}
