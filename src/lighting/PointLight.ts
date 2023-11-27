import Camera from 'nanogl-camera'
import { mat4 } from 'gl-matrix';
import LightType from './LightType'
import Bounds from '../Bounds';
import PunctualLight from './PunctualLight';

/**
 * This class manages point lights.
 */
class PointLight extends PunctualLight {

  readonly _type = LightType.POINT;

  /** The radius of the point light */
  private _radius: number;

  constructor() {
    super();


    this._radius = 0.0;
    this.radius = 50.0;
  }

  set castShadows(flag:boolean) {
    flag
  }

  /**
   * Get the radius of the point light.
   */
  get radius() { return this._radius }
  /**
   * Set the radius of the point light.
   * @param {number} v The new value
   */
  set radius(v) {
    this._radius = v;
  }



  /**
   * This will throw an error, as shadow mapping
   * is not supported on point lights.
   */
  projectionFromBounds(bounds: Bounds): mat4 {
    throw new Error("Shadow mapping not supported on point lights");
  }

  /**
   * This will throw an error, as shadow mapping
   * is not supported on point lights.
   */
  _createCamera(): Camera {
    throw new Error("Shadow mapping not supported on point lights");
  }

  /**
   * This will throw an error, as shadow mapping
   * is not supported on point lights.
   */
  getTexelBiasVector(): Float32Array {
    throw new Error("Shadow mapping not supported on point lights");
  }

}
export default PointLight