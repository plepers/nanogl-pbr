import { mat3, vec2 } from "gl-matrix";

import Chunk from "./Chunk";
import ChunksSlots from "./ChunksSlots";
import Input, { Uniform, Constant } from "./Input";

import { hashString, hashView, stringifyHash, mergeHash } from "./Hash";


const EPSILON = 0.000001;
const M3 = mat3.create()
const M3_IDENTITY = mat3.create()

function almostZero( f:number ) : boolean {
  return Math.abs(f)<EPSILON
}

function noTranslate( v:vec2) : boolean {
  return almostZero(v[0]) && almostZero(v[1]);
}

function noScale( v:vec2) : boolean {
  return almostZero(v[0]-1) && almostZero(v[1]-1);
}

const M2 = new Float32Array(4);


function fromTRS( res : mat3, translation :[number, number] , rotation : number, scale : [number, number]){
  const cos = Math.cos( rotation );
  const sin = Math.sin( rotation );
  res[0]= scale[0] * cos
  res[1]= scale[0] * -sin
  res[3]= scale[1] * sin
  res[4]= scale[1] * cos

  res[6]=translation[0];
  res[7]=translation[0];

  res[2]=0
  res[5]=0
  res[8]=0
}


/** Transformation options. */
export type TRSOpts = {
  /** The wanted translation */
  translation? : [number,number]
  /** The wanted rotation */
  rotation? : number
  /** The wanted scale */
  scale? : number
}

const _DefaultTexCoord = 'aTexCoord0'



// function mat3Equals( m1 : mat3, m2 : mat3 ) : boolean {
//   return (
//     almostZero( m1[0] - m2[0] ) &&
//     almostZero( m1[1] - m2[1] ) &&
//     almostZero( m1[3] - m2[3] ) &&
//     almostZero( m1[4] - m2[4] ) &&
//     almostZero( m1[6] - m2[6] ) &&
//     almostZero( m1[7] - m2[7] )
//   );
// }



const GLSL = {

  declareIn( name : string ): string {
    return `IN mediump vec2 ${name};`
  },

  declareOut( name : string ): string {
    return `OUT mediump vec2 ${name};`
  },

  transformCode(tc : TexCoord, tSource? : string, rsSource? : string ) : string {
    let tattrib = tc.attrib;
    if( rsSource !== undefined )
      tattrib = `mat2( ${rsSource}() ) * ${tattrib}`
    if( tSource  !== undefined )
      tattrib = `${tattrib} + ${tSource}()`
    return `${tc.varying()} = ${tattrib};`
  }

}

/**
 * This class handles the transformation of texture coordinates.
 */
export class TexCoordTransform {


  /** The transform data buffer */
  readonly buffer      : Float32Array = new Float32Array( 5 );

  /** The translation of the texcoords */
  readonly translation : vec2 = <vec2> new Float32Array (this.buffer.buffer, 0, 2);
  /** The scale of the texcoords */
  readonly scale       : vec2 = <vec2> new Float32Array (this.buffer.buffer, 8, 2);
  /** The rotation of the texcoords */
  readonly rotation    : Float32Array = new Float32Array(this.buffer.buffer, 16, 1);

  /**
   * Decompose given matrix in transform components.
   * This will set the translation, scale and rotation properties.
   *
   * @param {mat3} m The matrix to decompose
   */
  decomposeMatrix( m : mat3 ){
    this.translation[0] = m[6];
    this.translation[1] = m[7];
    this.scale[0]       = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    this.scale[1]       = Math.sqrt(m[3] * m[3] + m[4] * m[4]);
    this.rotation[0]    = Math.atan2( m[1], m[0] )

  }

  /**
   * Compose a matrix from the rotation and scale components.
   */
  composeMat2() : Float32Array {
    const cos = Math.cos( this.rotation[0] );
    const sin = Math.sin( this.rotation[0] );
    M2[0]= this.scale[0] * cos
    M2[1]= this.scale[0] * -sin
    M2[2]= this.scale[1] * sin
    M2[3]= this.scale[1] * cos
    return M2;
  }

  /**
   * Get the hashed transform data.
   */
  getTransformHash() : number {
    return hashView( this.buffer );
  }
}

/**
 * This class is the base class for texture coordinates.
 *
 * It manages the code generation for texture coordinates in a shader chunk.
 *
 * @extends {Chunk}
 */
abstract class TexCoord extends Chunk {
  /**
   * Create static texture coordinates without transformation
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   */
  static create( attrib? : string ) : StaticTexCoord {
    return new StaticTexCoord( attrib, M3_IDENTITY );
  }

  /**
   * Create static texture coordinates with transformation matrix
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   * @param {mat3} [matrix] The transformation matrix to use
   */
  static createTransformed( attrib? : string, matrix : mat3 = M3_IDENTITY ) : StaticTexCoord {
    return new StaticTexCoord( attrib, matrix );
  }

  /**
   * Create static texture coordinates with transformation options
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   * @param {TRSOpts} [trsOpt] The transformation options to use
   */
  static createFromTRS( attrib? : string, trsOpt : TRSOpts = {} ) : StaticTexCoord {
    const t = trsOpt.translation ?? [0,0]
    const r = trsOpt.rotation ?? 0
    const s = trsOpt.scale ?? 0
    fromTRS( M3, t, r, [s,s])
    return new StaticTexCoord( attrib, M3 );
  }

  /**
   * Create dynamic texture coordinates
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   */
  static createTransformedDynamic( attrib? : string ) : DynamicTexCoord {
    return new DynamicTexCoord( attrib );
  }

  /** The transformation of the texture coordinates */
  readonly _transform : TexCoordTransform;

  /** The name of the attribute for the texture coordinates */
  readonly attrib: string;
  /** The unique id of the texture coords */
  protected _uid : string = '';

  /**
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   * @param {boolean} hasSetup Whether the chunk needs program setup (for uniforms) or not
   */
  constructor( attrib : string = _DefaultTexCoord, hasSetup : boolean ){
    super( true, hasSetup )
    this.attrib = attrib;
    this._transform = new TexCoordTransform();
  }

  /** Get the varying name for the texture coords. */
  abstract varying() : string;
  /** Get the code for the texture coords transformation. */
  abstract getTransformCode() : string;

  /**
   * Generate the shader code for this TexCoord.
   * @param slots The slots to add the code to
   */
  _genCode(slots: ChunksSlots): void {
    slots.add('pf', GLSL.declareIn ( this.varying() ) );
    slots.add('pv', GLSL.declareOut( this.varying() ) );
    slots.add('pv', GLSL.declareIn( this.attrib ));
    slots.add('v' , this.getTransformCode() );
  }
}



/**
 * This class manages the code generation for
 * dynamic texture coordinates in a shader chunk.
 */
export class DynamicTexCoord extends TexCoord {
  /** The shader input for translation */
  private readonly _translateInput   : Input;
  /** The shader input for rotation & scale */
  private readonly _rotateScalesInput: Input;
  /** The shader uniform attached to the input for translation */
  private readonly _translateUniform     : Uniform;
  /** The shader uniform attached to the input for rotation & scale */
  private readonly _rotationScaleUniform : Uniform;

  /** The unique id for the texture coords */
  private static _UID = 0

  /**
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   */
  constructor( attrib : string = _DefaultTexCoord ){
    super( attrib, true )
    this._uid = `${DynamicTexCoord._UID++}`

    this._translateInput    = this.addChild( new Input(`tct_t_${this._uid}` , 2, Input.VERTEX ));
    this._rotateScalesInput = this.addChild( new Input(`tct_rs_${this._uid}`, 4, Input.VERTEX ));

    this._translateUniform      = new Uniform(`tct_ut_${this._uid}`,  2);
    this._rotationScaleUniform  = new Uniform(`tct_urs_${this._uid}`, 4);

    this._translateInput.attach( this._translateUniform );
    this._rotateScalesInput.attach( this._rotationScaleUniform );
  }

  varying() : string {
    return `vTexCoord_dtt${this._uid}`
  }

  getTransformCode() : string {
    return GLSL.transformCode( this, this._translateInput.name, this._rotateScalesInput.name )
  }

  /**
   * Set the translation of the texture coordinates.
   * @param {number} x The x translation
   * @param {number} y The y translation
   */
  translate(x:number, y:number) : this {
    this._transform.translation[0]=x;
    this._transform.translation[1]=y;
    this.updateTransform()
    return this;
  }

  /**
   * Set the rotation of the texture coordinates.
   * @param {number} rad The rotation (in radians)
   */
  rotate(rad:number) : this {
    this._transform.rotation[0] = rad;
    this.updateTransform()
    return this;
  }

  /**
   * Set the scale of the texture coordinates.
   * @param {number} x The x scale
   * @param {number} [y] The y scale
   */
  scale(x:number, y:number = x) : this {
    this._transform.scale[0]=x;
    this._transform.scale[1]=y;
    this.updateTransform()
    return this;
  }

  /**
   * Set the transform matrix of the texture coordinates.
   * @param {mat3} m The matrix to use
   */
  setMatrix( m : mat3 ){
    this._transform.decomposeMatrix(m);
    this.updateTransform()
  }


  /*
   * TODO: maybe not a good idea to trigger code invalidation when some transformation become null, in case of animation for example
   */
  /**
   * Update the shader uniforms with the current transform.
   */
  updateTransform(){
    this._translateUniform.set( ...this._transform.translation );
    this._rotationScaleUniform.set( ...this._transform.composeMat2() )
  }


}

/**
 * This class manages the code generation for
 * static texture coordinates in a shader chunk.
 *
 * The transformation cannot be changed after creation.
 */
export class StaticTexCoord extends TexCoord {

  /** The shader input for translation */
  private _translateInput?: Input;
  /** The shader input for rotation & scale */
  private _rotateScalesInput?: Input;

  /** The shader constant attached to the input for translation */
  private _translateConst?: Constant;
  /** The shader constant attached to the input for rotation & scale */
  private _rotateScalesConst?: Constant;

  /**
   * @param {string} [attrib] The name of the attribute for the texture coordinates
   * @param {mat3} matrix The transformation matrix to use
   */
  constructor( attrib : string = _DefaultTexCoord, matrix : mat3 ){
    super( attrib, false )

    this._transform.decomposeMatrix( matrix );
    const thash = stringifyHash( this._transform.getTransformHash() );


    if( !noTranslate(this._transform.translation ) ) {
      const input = new Input(`tct_t_${thash}` , 2, Input.VERTEX )
      this._translateInput = input;
      this._translateConst = input.attachConstant(this._transform.translation);
      this.addChild( input );
    }

    if( !noScale(this._transform.scale) || !almostZero( this._transform.rotation[0]) ){
      const input = new Input(`tct_rs_${thash}`, 4, Input.VERTEX )
      this._rotateScalesInput = input;
      this._rotateScalesConst = input.attachConstant(this._transform.composeMat2());
      this.addChild( input );
    }

  }

  varying() : string {
    const hash = mergeHash( hashString( this.attrib ) , this._transform.getTransformHash() )
    return `vTexCoord_${stringifyHash( hash )}`
  }

  getTransformCode() : string {
    return GLSL.transformCode( this, this._translateInput?.name, this._rotateScalesInput?.name )
  }


}

export default TexCoord;