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
  private _falloffCurve: number;
  
  _falloffData: Float32Array;

  constructor( gl : GLContext ) {
    super( gl );

    this._type = LightType.POINT;

    this._falloffData = new Float32Array(3);

    this._radius = 0.0;
    this._falloffCurve = 0.0;

    this.radius = 50.0;
    this.falloffCurve = 2.0;
  }




  castShadows(flag:boolean) {
    return;
  }

  _updateFalloffData() {
    this._falloffData[0] = -this._falloffCurve;
    this._falloffData[1] = -1 + this._falloffCurve;
    this._falloffData[2] = 1 / this._radius;
  }

  get radius() { return this._radius }
  set radius(v) {
    this._radius = v;
    this._updateFalloffData();
  }


  get falloffCurve() { return this._falloffCurve }
  set falloffCurve(v) {
    this._falloffCurve = v;
    this._updateFalloffData();
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