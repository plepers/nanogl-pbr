import { mat3, vec2 } from "gl-matrix";

import Chunk from "./Chunk";
import ChunkSlots from "./ChunksSlots";
import Input, { Uniform } from "./Input";

import code from './glsl/templates/texCoord.glsl'
import hashBuilder, { Hash, hashString } from "./Hash";


const EPSILON = 0.000001;
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


function composeMat2( scale : vec2, r : number ) : Float32Array {
  const cos = Math.cos( r );
  const sin = Math.sin( r );
  M2[0]= scale[0] * cos
  M2[1]= scale[0] * -sin
  M2[2]= scale[1] * sin
  M2[3]= scale[1] * cos
  return M2;
}

function mat3Equals( m1 : mat3, m2 : mat3 ) : boolean {
  return (
    almostZero( m1[0] - m2[0] ) &&
    almostZero( m1[1] - m2[1] ) &&
    almostZero( m1[3] - m2[3] ) &&
    almostZero( m1[4] - m2[4] ) &&
    almostZero( m1[6] - m2[6] ) &&
    almostZero( m1[7] - m2[7] )
  );
}




export abstract class TexCoordTransform extends Chunk {

  private static _UID = 0

  readonly attrib: string;

  readonly _translateInput   : Input;
  readonly _rotateScalesInput: Input;
  
  _buffer      : Float32Array = new Float32Array( 5 );

  _translation : vec2 = <vec2> new Float32Array(this._buffer.buffer, 0, 2);
  _scale       : vec2 = <vec2> new Float32Array(this._buffer.buffer, 8, 2);
  _rotation    : Float32Array = new Float32Array(this._buffer.buffer, 16, 1);


  protected _uid : string = `${TexCoordTransform._UID++}`

  constructor( attrib : string, hasSetup: boolean ){
    super( true, hasSetup );
    this.attrib = attrib;
    this._translateInput    = this.addChild( new Input(`tct_t_${this._uid}` , 2, Input.VERTEX ));
    this._rotateScalesInput = this.addChild( new Input(`tct_rs_${this._uid}`, 4, Input.VERTEX ));
  }

  protected _genCode(slots: ChunkSlots): void {
    const varying = this.varying();
    slots.add('pf', code({ declare_fragment_varying: true, varying }));
    slots.add('pv', code({ declare_vertex_varying  : true, varying }));
    slots.add('v' , code({ vertex_body: true, uid: this._uid, varying, attrib : this.attrib  }));
  }

  varying() : string {
    return `vTexCoord_tct${this._uid}`
  }

  protected _getHash(): Hash {
    return hashBuilder.start()
      .hashView(this._buffer)
      .hashString( this.varying() )
      .get()
  }


  protected decomposeMatrix( m : mat3 ){
    this._translation[0] = m[6];
    this._translation[1] = m[7];
    this._scale[0]       = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    this._scale[1]       = Math.sqrt(m[3] * m[3] + m[4] * m[4]);
    this._rotation[0]    = Math.atan2( m[1], m[0] )
    this.updateTransform()
  }



  abstract updateTransform() : void;
}



export class DynamicTexCoordTransform extends TexCoordTransform {

  private readonly _translateUniform     : Uniform;
  private readonly _rotationScaleUniform : Uniform;

  constructor( attrib : string ){
    super( attrib, true )

    this._translateUniform      = new Uniform(`tct_ut_${this._uid}`,  2);
    this._rotationScaleUniform  = new Uniform(`tct_urs_${this._uid}`, 4);

  }

  translate(x:number, y:number) : this {
    this._translation[0]=x;
    this._translation[1]=y;
    this.updateTransform()
    return this;
  }

  rotate(rad:number) : this {
    this._rotation[0] = rad;
    this.updateTransform()
    return this;
  }

  scale(x:number, y:number = x) : this {
    this._scale[0]=x;
    this._scale[1]=y;
    this.updateTransform()
    return this;
  }

  setMatrix( m : mat3 ){
    this.decomposeMatrix(m);
  }


  /*
   * TODO: maybe not a good idea to trigger code invalidation when some transformation become null, in case of animation for example
   */
  updateTransform(){
    if (noTranslate(this._translation ) ) {
      this._translateInput.detach();
    } else {
      this._translateInput.attach( this._translateUniform );
      this._translateUniform.set( ...this._translation );
    }

    if( noScale(this._scale) && almostZero( this._rotation[0]) ){
      this._rotateScalesInput.detach();
    } else {
      this._rotateScalesInput.attach( this._rotationScaleUniform );
      
      this._rotationScaleUniform.set( ...composeMat2( this._scale, this._rotation[0] ) )
    }
  }


}


export class StaticTexCoordTransform extends TexCoordTransform {

  _matrix: mat3;

  constructor( attrib : string, matrix : mat3 ){
    super( attrib, false )
    this._matrix = mat3.copy( mat3.create(), matrix);
    this.decomposeMatrix( matrix );
  }
  
  updateTransform(){
    if (noTranslate(this._translation ) ) {
      this._translateInput.detach();
    } else {
      this._translateInput.attachConstant( this._translation );
    }

    if( noScale(this._scale) && almostZero( this._rotation[0]) ){
      this._rotateScalesInput.detach();
    } else {
      this._rotateScalesInput.attachConstant( composeMat2( this._scale, this._rotation[0] ) )
    }
  }

  equalMatrix( m:mat3 ){
    return mat3Equals( m, this._matrix );
  }

}



export default class TexCoord extends Chunk {


  readonly attrib: string;
  readonly _statics : StaticTexCoordTransform[] = [];
  private _identity : StaticTexCoordTransform | null = null;

  constructor( attrib : string = 'aTexCoord0' ){
    super( true, false )
    this.attrib = attrib;
  }


  addTransform() : DynamicTexCoordTransform {
    const tct =  new DynamicTexCoordTransform(this.attrib);
    this.addChild(tct);
    return tct;
  }
  
  addStaticTransform( matrix : mat3 ) : StaticTexCoordTransform {
    const matchTct = this.getStaticTransform( matrix );
    if( matchTct !== null ) return matchTct;
    
    const tct = new StaticTexCoordTransform(this.attrib, matrix );
    this.addChild(tct);
    this._statics.push( tct );
    return tct;
  }

  varying() : string {
    if( this._identity === null ){
      this._identity = this.addStaticTransform(M3_IDENTITY)
    }
    return this._identity.varying();
  }

  private getStaticTransform( matrix : mat3 ) : StaticTexCoordTransform | null{
    for (const tct of this._statics) {
      if( tct.equalMatrix(matrix) ){
        return tct;
      }
    }
    return null;
  }

  protected _genCode(slots: ChunkSlots): void {
    slots.add('pv', code({ declare_attribute: true, attrib: this.attrib }));
  }
  
  protected _getHash(): Hash {
    return hashString(`_tc_${this.attrib}`)
  }
  
}