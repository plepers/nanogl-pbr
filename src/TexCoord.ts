import { mat3, vec2 } from "gl-matrix";

import Chunk from "./Chunk";
import ChunkSlots from "./ChunksSlots";
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



type TRSOpts = {
  translation? : [number,number]
  rotation? : number
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


class TexCoordTransform {



  readonly buffer      : Float32Array = new Float32Array( 5 );

  readonly translation : vec2 = <vec2> new Float32Array (this.buffer.buffer, 0, 2);
  readonly scale       : vec2 = <vec2> new Float32Array (this.buffer.buffer, 8, 2);
  readonly rotation    : Float32Array = new Float32Array(this.buffer.buffer, 16, 1);


  decomposeMatrix( m : mat3 ){
    this.translation[0] = m[6];
    this.translation[1] = m[7];
    this.scale[0]       = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    this.scale[1]       = Math.sqrt(m[3] * m[3] + m[4] * m[4]);
    this.rotation[0]    = Math.atan2( m[1], m[0] )

  }

  composeMat2() : Float32Array {
    const cos = Math.cos( this.rotation[0] );
    const sin = Math.sin( this.rotation[0] );
    M2[0]= this.scale[0] * cos
    M2[1]= this.scale[0] * -sin
    M2[2]= this.scale[1] * sin
    M2[3]= this.scale[1] * cos
    return M2;
  }

  getTransformHash() : number {
    return hashView( this.buffer );
  }
}


abstract class TexCoord extends Chunk {

  static create( attrib? : string ) : StaticTexCoord {
    return new StaticTexCoord( attrib, M3_IDENTITY );
  }
  
  static createTransformed( attrib? : string, matrix : mat3 = M3_IDENTITY ) : StaticTexCoord {
    return new StaticTexCoord( attrib, matrix );
  }

  static createFromTRS( attrib? : string, trsOpt : TRSOpts = {} ) : StaticTexCoord {
    const t = trsOpt.translation ?? [0,0]
    const r = trsOpt.rotation ?? 0
    const s = trsOpt.scale ?? 0
    fromTRS( M3, t, r, [s,s])
    return new StaticTexCoord( attrib, M3 );
  }
  
  static createTransformedDynamic( attrib? : string ) : DynamicTexCoord {
    return new DynamicTexCoord( attrib );
  }


  readonly _transform : TexCoordTransform;

  readonly attrib: string;
  protected _uid : string = '';

  constructor( attrib : string = _DefaultTexCoord, hasSetup : boolean ){
    super( true, hasSetup )
    this.attrib = attrib;
    this._transform = new TexCoordTransform();
  }

  abstract varying() : string;
  abstract getTransformCode() : string;

  _genCode(slots: ChunkSlots): void {
    slots.add('pf', GLSL.declareIn ( this.varying() ) );
    slots.add('pv', GLSL.declareOut( this.varying() ) );
    slots.add('pv', GLSL.declareIn( this.attrib ));
    slots.add('v' , this.getTransformCode() );
  }
}




export class DynamicTexCoord extends TexCoord {

  private readonly _translateInput   : Input;
  private readonly _rotateScalesInput: Input;
  private readonly _translateUniform     : Uniform;
  private readonly _rotationScaleUniform : Uniform;

  private static _UID = 0
  
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

  translate(x:number, y:number) : this {
    this._transform.translation[0]=x;
    this._transform.translation[1]=y;
    this.updateTransform()
    return this;
  }

  rotate(rad:number) : this {
    this._transform.rotation[0] = rad;
    this.updateTransform()
    return this;
  }

  scale(x:number, y:number = x) : this {
    this._transform.scale[0]=x;
    this._transform.scale[1]=y;
    this.updateTransform()
    return this;
  }
  
  setMatrix( m : mat3 ){
    this._transform.decomposeMatrix(m);
    this.updateTransform()
  }


  /*
   * TODO: maybe not a good idea to trigger code invalidation when some transformation become null, in case of animation for example
   */
  updateTransform(){
    this._translateUniform.set( ...this._transform.translation );
    this._rotationScaleUniform.set( ...this._transform.composeMat2() )
  }


}


export class StaticTexCoord extends TexCoord {
  
  private _translateConst?: Constant;
  private _rotateScalesConst?: Constant;
  
  constructor( attrib : string = _DefaultTexCoord, matrix : mat3 ){
    super( attrib, false )
    
    this._transform.decomposeMatrix( matrix );
    const thash = stringifyHash( this._transform.getTransformHash() );
    
    
    if( !noTranslate(this._transform.translation ) ) {
      const input = new Input(`tct_t_${thash}` , 2, Input.VERTEX )
      this._translateConst = input.attachConstant(this._transform.translation);
      this.addChild( input );
    }
    
    if( !noScale(this._transform.scale) || !almostZero( this._transform.rotation[0]) ){
      const input = new Input(`tct_rs_${thash}`, 4, Input.VERTEX )
      this._rotateScalesConst = input.attachConstant(this._transform.composeMat2());
      this.addChild( input );
    }


  }
  
  varying() : string {
    const hash = mergeHash( hashString( this.attrib ) , this._transform.getTransformHash() ) 
    return `vTexCoord_${stringifyHash( hash )}`
  }

  getTransformCode() : string {
    return GLSL.transformCode( this, this._translateConst?._input?.name, this._rotateScalesConst?._input?.name )
  }


}

export default TexCoord;