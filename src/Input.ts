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

/** The types of shaders. */
export enum ShaderType {
  FRAGMENT = 1,
  VERTEX = 2,
  ALL = FRAGMENT | VERTEX,
}

/** The size of an input value (`1` for float, `2` for vec2, etc.) */
export type InputSize = 1 | 2 | 3 | 4

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

/**
 * The type of an input parameter.
 */
export enum ParamType {
  /** A sampler input param */
  SAMPLER,
  /** A uniform input param */
  UNIFORM,
  /** An attribute input param */
  ATTRIBUTE,
  /** An constant input param */
  CONSTANT,
}


/**
 * An input parameter for shaders.
 *
 * They handle the declaration of sampler, uniform, attribute
 * and constant input parameters for shaders.
 */
export interface IInputParam {
  /** The type of the input param */
  readonly ptype : ParamType;
  /** The name of the input param */
  name: string;
  /** The size of the input param value */
  size: InputSize;
  /**
   * The name of the variable created for this input param,
   * used to access the value in the shader code.
   */
  token: string;

  /**
   * Generate the shader code for this input param.
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {Input} input The input this param is attached to
   */
  genInputCode(slots: ChunksSlots, input: Input):void;

}

/** An input parameter of a {@link ParamType} type. */
export type InputParam = Sampler | Uniform | Attribute | Constant;



/**
 * This class is the base class for all shader input parameters.
 *
 * They handle the declaration of sampler, uniform, attribute
 * and constant input parameters for shaders.
 *
 * @extends {Chunk}
 */
export abstract class BaseParams extends Chunk {
  /** The colorspace of this input param */
  protected _colorspace: ColorSpace = ColorSpace.AUTO;

  /**
   * @param {boolean} [hasCode=false] Whether this input param needs shader code generation or not
   * @param {boolean} [hasSetup=false] Whether this input param needs program setup (for uniforms) or not
   */
  constructor(hasCode: boolean = false, hasSetup: boolean = false) {
    super(hasCode, hasSetup);
  }

  /**
   * Set the colorspace of this input param value.
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   * @param {ColorSpace} c The new colorspace
   */
  set colorspace( c : ColorSpace ) {
    if( this._colorspace !== c ) {
      this._colorspace = c;
      this.invalidateCode();
    }
  }

  /**
   * Get the colorspace of this input param.
   */
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



/**
 * This class manages sampler input parameters
 * for shaders.
 *
 * It handles the declaration of a sampler uniform, its sampling
 * and its colorspace.
 *
 * @extends {BaseParams}
 */
export class Sampler extends BaseParams implements IInputParam {

  readonly ptype : ParamType.SAMPLER = ParamType.SAMPLER

  name: string;
  size: InputSize;
  token: string;
  /** The texture for this sampler param */
  _tex: Texture2D | null;

  /**
   * The texture coordinates manager for this sampler param,
   * or the name of the varying to use as texture coordinates.
   */
  texCoords: TexCoord | string;
  /** The name of the varying for the texture coordinates */
  _varying : string;

  /**
   * @param {string} name The name of the sampler param
   * @param {TexCoord | string} [texCoords] The texture coordinates manager for this sampler param,
   * or the name of the varying to use as texture coordinates
   * @param {ColorSpace} [colorspace] The colorspace of the sampler param
   */
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


  /**
   * Set the texture for this sampler param.
   * @param t The texture to use
   */
  set(t: Texture2D) {
    this._tex = t;
  }

  /**
   * This method is not used for input params.
   */
  protected _genCode(slots: ChunksSlots): void {}

  /**
   * Generate the shader code for this sampler param and
   * add it to the given slots in the input attached shader type.
   *
   * The texture uniform can be accessed with the name of the sampler in the shader.
   * The sampled texture data can be accessed with the token of the sampler in the shader.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {Input} input The input this param is attached to
   */
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

  /**
   * Generate the shader code for the colorspace transform of an sampler param variable.
   * @param from The colorspace the variable is in
   * @param to The colorspace we want to transform to
   * @param v The access to the variable to transform
   */
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

/**
 * This class manages uniform input parameters
 * for shaders.
 *
 * It handles the declaration of a uniform, and its colorspace.
 *
 * @extends {BaseParams}
 */
export class Uniform extends BaseParams implements IInputParam {

  readonly ptype : ParamType.UNIFORM = ParamType.UNIFORM

  readonly name: string;
  readonly size: InputSize;
  token: string;

  /** The value of the uniform */
  private _value: Float32Array

  /** Get the current value of the uniform */
  public get value(): Float32Array {
    return this._value
  }

  /**
   * Set the x value of the uniform,
   * for vectors of size 1, 2, 3 or 4.
   * @param {number} v The new value
   */
  public set x(v: number) {this._value[0] = v}
  /**
   * Set the y value of the uniform,
   * for vectors of size 2, 3 or 4.
   * @param {number} v The new value
   */
  public set y(v: number) {this._value[1] = v}
  /**
   * Set the z value of the uniform,
   * for vectors of size 3 or 4.
   * @param {number} v The new value
   */
  public set z(v: number) {this._value[2] = v}
  /**
   * Set the w value of the uniform,
   * for vectors of size 4.
   * @param {number} v The new value
   */
  public set w(v: number) {this._value[3] = v}

  /**
   * Get the x value of the uniform,
   * for vectors of size 1, 2, 3 or 4.
   */
  public get x(): number {return this._value[0]}
  /**
   * Get the y value of the uniform,
   * for vectors of size 2, 3 or 4.
   */
  public get y(): number {return this._value[1]}
  /**
   * Get the z value of the uniform,
   * for vectors of size 3 or 4.
   */
  public get z(): number {return this._value[2]}
  /**
   * Get the w value of the uniform,
   * for vectors of size 4.
   */
  public get w(): number {return this._value[3]}

  /**
   * @param name The name of the uniform param
   * @param size The size of the uniform param value
   */
  constructor(name: string, size: InputSize) {

    super(true, true);

    this.name = name;
    this.size = size;
    this._value = new Float32Array(size);
    this.token = 'VAL_'+this.name;
  }




  /**
   * Set the value of the uniform.
   * @param {number[]} args The new value
   */
  set(...args: number[]) {
    for (var i = 0; i < args.length; i++) {
      this._value[i] = args[i];
    }
    this._invalid = true;
  }

  /**
   * This method is not used for input params.
   */
  protected _genCode(slots: ChunksSlots): void {}

  /**
   * Generate the shader code for this uniform param and
   * add it to the given slots in the input attached shader type.
   *
   * The uniform can be accessed with the name of the input param in the shader.
   * The uniform value, with transformed colorspace,
   * can be accessed with the token of the input param in the shader.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {Input} input The input this param is attached to
   */
  genInputCode(slots: ChunksSlots, input: Input) {
    // PF
    let c = `uniform ${TYPES[this.size]} ${this.name};\n`;
    c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, this.name)
    _addPreCode(slots, input.shader, c);
    // slots.add( 'pf', c );

  }

  /**
   * Setup the given program for this uniform param.
   * @param {Program} prg The program to setup
   */
  setup(prg: Program) {
    prg[this.name](this._value);
    this._invalid = false;
  }

  /**
   * Generate the shader code for the colorspace transform of a uniform param variable.
   * @param from The colorspace the variable is in
   * @param to The colorspace we want to transform to
   * @param d The name of the variable to create for the transformed value
   * @param v The access to the variable to transform
   */
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

/**
 * This class manages attribute input parameters
 * for shaders.
 *
 * It handles the declaration of an attribute
 * and the corresponding varying.
 *
 * @extends {BaseParams}
 */
export class Attribute extends BaseParams implements IInputParam {

  readonly ptype : ParamType.ATTRIBUTE = ParamType.ATTRIBUTE

  name: string;
  size: InputSize;
  token: string;

  /**
   * @param name The name of the attribute param
   * @param size The size of the attribute param value
   */
  constructor(name: string, size: InputSize) {
    super(true, false);

    this.name = name;
    this.size = size;
    this.token = `v_${this.name}`;
  }



  /**
   * This method is not used for input params.
   */
  protected _genCode(slots: ChunksSlots): void {}

  /**
   * Generate the shader code for this attribute param and
   * add it to the given slots.
   *
   * The attribute can be accessed with the name of the input param in the vertex shader.
   * The corresponding varying can be accessed with the token of the input param
   * in the fragment shader.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {Input} input The input this param is attached to
   */
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


/**
 * This class manages constant input parameters
 * for shaders.
 *
 * It handles the definition of an constant, and its colorspace.
 *
 * @extends {BaseParams}
 */
export class Constant extends BaseParams implements IInputParam {

  readonly ptype : ParamType.CONSTANT = ParamType.CONSTANT

  name: string = '';
  size: InputSize = 1;
  token: string = '';
  /** The value of the constant */
  value: ArrayLike<number> | number = 0;
  /** The hash of the the constant */
  _hash: Hash = 0

  /**
   * @param {ArrayLike<number> | number} value The value of the constant
   */
  constructor(value: ArrayLike<number> | number) {
    super(true, false);
    this.set( value )
  }

  /**
   * Set the value of this constant input param.
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   * @param {ArrayLike<number> | number} value The new value
   */
  set( value: ArrayLike<number> | number) {

    if ( typeof value === 'number' ) {
      this.size = 1;
      this.value = value;
    } else {
      this.size = <InputSize>value.length;
      this.value = Array.from(value);
    }

    const hash = this._hash
    this._hash = hashString( `${this.size}-${this._stringifyValue()}` )
    this.name = `CONST_${stringifyHash( this._hash )}`;
    this.token = `VAR_${this.name}`;

    if( hash !== this._hash ){
      this.invalidateCode()
    }
  }

  /**
   * This method is not used for input params.
   */
  protected _genCode(slots: ChunksSlots): void {}

  /**
   * Generate the shader code for this constant param and
   * add it to the given slots in the input attached shader type.
   *
   * The constant can be accessed with the token of the input param,
   * prepended with "RAW", in the shader.
   * The constant value, with transformed colorspace,
   * can be accessed with the token of the input param in the shader.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {Input} input The input this param is attached to
   */
  genInputCode(slots: ChunksSlots, input: Input) {
    let c = `#define RAW_${this.token} ${TYPES[this.size]}(${this._stringifyValue()})\n`;
    c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, 'RAW_'+this.token)
    _addPreCode(slots, input.shader, c );
  }

  /**
   * Stringify the value of this constant input param.
   */
  _stringifyValue() {
    if (this.size === 1) {
      return this.value.toString();
    } else {
      const a = <number[]>this.value;
      return a.map(_floatStr).join(',');
    }
  }


}


/**
 * This class manages inputs for shaders.
 *
 * It handles the underlying {@link InputParam},
 * for samplers, uniforms, attributes and constants.
 */
export default class Input extends Chunk {

  /** Sampler input parameter */
  static readonly Sampler = Sampler;
  /** Uniform input parameter */
  static readonly Uniform = Uniform;
  /** Attribute input parameter */
  static readonly Attribute = Attribute;
  /** Constant input parameter */
  static readonly Constant = Constant;

  /** Fragment shader type */
  static readonly FRAGMENT = ShaderType.FRAGMENT;
  /** Vertex shader type */
  static readonly VERTEX = ShaderType.VERTEX;
  /** Both shaders shader type */
  static readonly ALL = ShaderType.ALL;

  /** The name of the input */
  readonly name : string;
  /** The size of the input value */
  readonly size : InputSize;
  /** The type of shader this input is attached to */
  readonly shader: ShaderType;

  /** The colorspace of the input's value as is should be decoded */
  private _colorspace: ColorSpace = ColorSpace.LINEAR;

  /** The swizzle operator to access the input's value */
  comps: Swizzle;
  /** The input parameter attached to this input */
  param: InputParam | null;


  /**
   * @param {string} name The name of the input
   * @param {InputSize} size The size of the input value
   * @param {ShaderType} [shader] The type of shader this input is attached to
   * @param {ColorSpace} [colorspace] The colorspace of the input's value as is should be decoded
   */
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
   * Set the colorspace of the input's value as is should be decoded.
   *
   * To set the colorspace of the value we are providing,
   * set the colorspace property of the attached input parameter.
   * The input param's value will be transformed from its colorspace
   * to the input's colorspace in the shader.
   *
   * The code will be invalidated if the value changes,
   * and need to be re-generated.
   *
   * @param {ColorSpace} c The new colorspace
   */
  set colorspace( c : ColorSpace ) {
    if( this._colorspace !== c ) {
      this._colorspace = c;
      this.invalidateCode();
    }
  }

  /**
   * Get the colorspace of the input's value as is should be decoded.
   */
  get colorspace() {
    return this._colorspace;
  }


  /**
   * Attach an input parameter to this input.
   * @param {InputParam|null} param The input parameter to attach
   * @param {Swizzle} [comps] The swizzle operator to access the value
   */
  attach(param: InputParam|null, comps: Swizzle = 'rgba') {
    if (this.param) {
      this.removeChild(this.param);
    }
    this.param = param;
    if( param !== null ){
      this.comps = _trimComps(comps, this.size);
      this.addChild(param);
    }
  }

  /**
   * Detach the input parameter from this input.
   */
  detach() {
    if (this.param !== null) {
      this.removeChild(this.param);
    }
    this.param = null;
  }

  /**
   * Create a Sampler input parameter and attach it to this input.
   *  @param {string} [name] The name of the sampler param
   * @param {TexCoord | string} [texCoords] The texture coordinates manager for this sampler param,
   * or the name of the varying to use as texture coordinates
   * @param {Swizzle} [comps] The swizzle operator to access the value
   */
  attachSampler(name: string = `T${this.name}`, texCoords: string | TexCoord= TexCoord.create(), comps: Swizzle = 'rgba') {
    const p = new Sampler(name, texCoords);
    this.attach(p, comps);
    return p;
  }

  /**
   * Create a Uniform input parameter and attach it to this input.
   *  @param {string} [name] The name of the uniform param
   * @param {InputSize} [size] The size of the uniform param value
   * @param {Swizzle} [comps] The swizzle operator to access the value
   */
  attachUniform(name: string = `U${this.name}`, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    const p = new Uniform(name, size);
    this.attach(p, comps);
    return p;
  }

  /**
   * Create an Attribute input parameter and attach it to this input.
   *  @param {string} [name] The name of the attribute param
   * @param {InputSize} [size] The size of the attribute param value
   * @param {Swizzle} [comps] The swizzle operator to access the value
   */
  attachAttribute(name: string = `A${this.name}`, size: InputSize = this.size, comps: Swizzle = 'rgba') {
    const p = new Attribute(name, size);
    this.attach(p, comps);
    return p;
  }

  /**
   * Create an Constant input parameter and attach it to this input.
   *  @param {ArrayLike<number> | number} name The value of the constant param
   * @param {Swizzle} [comps] The swizzle operator to access the value
   */
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


  /**
   * Generate the shader code for this input.
   *
   * For more details, see the `genInputCode` method of the
   * chosen input param type.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   */
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
