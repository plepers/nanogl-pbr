import Camera from 'nanogl-camera'
import { mat4 } from 'gl-matrix';
import LightType from './LightType'
import Bounds from '../Bounds';
import PunctualLight from './PunctualLight';


class PointLight extends PunctualLight {

  readonly _type = LightType.POINT;

  private _radius: number;

  constructor() {
    super();


    this._radius = 0.0;
    this.radius = 50.0;
  }

  set castShadows(flag:boolean) {
    flag
  }

  get radius() { return this._radius }
  set radius(v) {
    this._radius = v;
  }




  projectionFromBounds(bounds: Bounds): mat4 {
    throw new Error("Shadow mapping not supported on point lights");
  }

  _createCamera(): Camera {
    throw new Error("Shadow mapping not supported on point lights");
  }
  
  getTexelBiasVector(): Float32Array {
    throw new Error("Shadow mapping not supported on point lights");
  }

}
export default PointLight