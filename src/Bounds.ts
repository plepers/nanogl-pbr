import { vec3, mat4 } from "gl-matrix";


const MINMAX_DATA = new Float32Array([Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE])
const TMP_DATA    = new Float32Array(6)
const VEC3 = vec3.create()

/**
 * This class represents a 3D bounding sphere.
 */
export class BoundingSphere {
  /**
   * The center of the bounding sphere
   * @defaultValue vec3(0, 0, 0)
   */
  readonly center: vec3 = vec3.create();
  /**
   * The radius of the bounding sphere
   * @defaultValue vec3(0, 0, 0)
   */
  readonly radius: vec3 = vec3.create();

  /**
   * Compute a bounding sphere from given Bounds,
   * and write the result to the out BoundingSphere.
   * @param {BoundingSphere} out The BoundingSphere to write the result to
   * @param {Bounds} b The Bounds to use
   */
  static fromBounds( out : BoundingSphere,  b : Bounds ) : void {

    out.center[0] = 0.5 * (b.min[0] + b.max[0]);
    out.center[1] = 0.5 * (b.min[1] + b.max[1]);
    out.center[2] = 0.5 * (b.min[2] + b.max[2]);

    out.radius[0] = b.max[0] - out.center[0];
    out.radius[1] = b.max[1] - out.center[1];
    out.radius[2] = b.max[2] - out.center[2];

  }

}

/**
 * This class represents a 3D bounding box.
 */
export default class Bounds {
  /** The minimum & maximum positions data */
  protected _mmData = new Float32Array(6);

  /** The minimum position of the bounds */
  readonly min   : vec3;
  /** The maximum position of the bounds */
  readonly max   : vec3;

  constructor(){
    this.min = <vec3> new Float32Array(this._mmData.buffer, 0, 3);
    this.max = <vec3> new Float32Array(this._mmData.buffer, 12, 3);
  }

  /**
   * Set the bounds to zero.
   * Both the minimum and the maximum positions are set to zero.
   */
  zero(){
    this.min.set([0,0,0])
    this.max.set([0,0,0])
  }

  /**
   * Copy the bounds from another Bounds instance.
   * @param {Bounds} b The bounds to copy from
   */
  copyFrom( b:Bounds ){
    this.min.set(b.min);
    this.max.set(b.max);
  }

  /**
   * Set the bounds from min and max positions.
   * @param {number[] | Float32Array} min The minimum position
   * @param {number[] | Float32Array} max The maximum position
   */
  fromMinMax( min:number[] | Float32Array, max : number[] | Float32Array ) {
    this.min.set(min);
    this.max.set(max);
  }

  /**
   * Compute the union of given Bounds, and write the result to the out Bounds.
   * @param {Bounds} out The Bounds to write the result to
   * @param {Bounds} a The first Bounds to use
   * @param {Bounds} b The second Bounds to use
   */
  static union( out: Bounds, a : Bounds, b : Bounds ) {
    for (var i = 0; i < 3; i++) {
      out.min[i] = Math.min(a.min[i], b.min[i]);
      out.max[i] = Math.max(a.max[i], b.max[i]);
    }

  }

  /**
   * Transform the given Bounds with a matrix,
   * and write the result to the out Bounds.
   * @param {Bounds} out The Bounds to write the result to
   * @param {Bounds} bounds The Bounds to transform
   * @param {mat4} matrix The matrix to use for the transformation
   */
  static transform( out : Bounds, bounds : Bounds, matrix : mat4 ){

    const mm = TMP_DATA
    const min = bounds.min;
    const max = bounds.max;

    mm.set( MINMAX_DATA );

    for ( var bCorner = 0; 8 > bCorner; ++bCorner) {
      VEC3[0] = (bCorner & 1) ? max[0] : min[0];
      VEC3[1] = (bCorner & 2) ? max[1] : min[1];
      VEC3[2] = (bCorner & 4) ? max[2] : min[2];

      vec3.transformMat4(VEC3, VEC3, matrix);

      mm[0] = Math.min( mm[0], VEC3[0] );
      mm[1] = Math.min( mm[1], VEC3[1] );
      mm[2] = Math.min( mm[2], VEC3[2] );
      mm[3] = Math.max( mm[3], VEC3[0] );
      mm[4] = Math.max( mm[4], VEC3[1] );
      mm[5] = Math.max( mm[5], VEC3[2] );
    }

    out._mmData.set( TMP_DATA );
  }

}
