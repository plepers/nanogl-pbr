import Light from './Light'
import Camera from 'nanogl-camera'
import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import LightType from './LightType'
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import Bounds from './Bounds';

const BiasVector = new Float32Array(4);


class PointLight extends Light {


  private _radius: number;

  constructor() {
    super();

    this._type = LightType.POINT;

    this._radius = 0.0;
    this.radius = 50.0;
  }


  castShadows(flag:boolean) {
    return;
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