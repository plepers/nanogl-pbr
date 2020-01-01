import Light from './Light'
import Camera from 'nanogl-camera'
import LightType from './LightType'
import Bounds from './Bounds'
import { GLContext } from 'nanogl/types';
import PerspectiveLens from 'nanogl-camera/perspective-lens'

const BiasVector = new Float32Array(4);



class SpotLight extends Light {


  private _angle: number;
  private _sharpness: number;
  private _radius: number;
  private _falloffCurve: number;
  
  _spotData: Float32Array;
  _falloffData: Float32Array;

  _camera: Camera<PerspectiveLens>|null = null;


  constructor( gl: GLContext ) {
    super(gl);
    this._type = LightType.SPOT;

    this._spotData = new Float32Array(2);
    this._falloffData = new Float32Array(3);

    this._angle = 0.0;
    this._sharpness = 0.0;
    this._radius = 0.0;
    this._falloffCurve = 0.0;

    this.angle = Math.PI / 4;
    this.sharpness = 0.0;
    this.radius = 50.0;
    this.falloffCurve = 2.0;
  }





  projectionFromBounds( bounds: Bounds ) : void{

    const oBounds = this.boundsInLocalSpace(bounds);
    let zMin = -oBounds[2],
        zMax = -oBounds[5];

    zMin = Math.min(zMin, 1 / this._falloffData[2]);
    zMax = Math.max(0.005 * zMin, zMax);

    const lens = this._camera!.lens;
    lens.near = zMax;
    lens.far = zMin;
  }


  getTexelBiasVector() {
    var mtx = this._camera!._view;
    var zMin = -2.0 * Math.tan(this._angle);
    BiasVector[0] = mtx[2] * zMin;
    BiasVector[1] = mtx[6] * zMin;
    BiasVector[2] = mtx[10] * zMin;
    BiasVector[3] = mtx[14] * zMin;
    return BiasVector;
  }


  _createCamera() : Camera<PerspectiveLens> {
    var cam = Camera.makePerspectiveCamera();
    cam.lens.aspect = 1;
    cam.lens.fov = this._angle;
    cam.lens.near = 15 - 5
    cam.lens.far = 15 + 5
    return cam;
  }



  get angle() { return this._angle; }
  set angle( v :number ) {
    this._angle = v;
    this._updateSpotData();
    if (this._castShadows) {
      this._camera!.lens.fov = this._angle;
    }
  }


  get sharpness() { return this._sharpness }
  set sharpness( v : number ) {
    this._sharpness = v;
    this._updateSpotData();
  }


  get radius() { return this._radius }
  set radius( v : number ) {
    this._radius = v;
    this._updateFalloffData();
  }


  get falloffCurve() { return this._falloffCurve }
  set falloffCurve( v : number ) {
    this._falloffCurve = v;
    this._updateFalloffData();
  }


  _updateSpotData() {
    this._spotData[0] = 1.0 + (this._sharpness * 100.0);
    this._spotData[1] = 2 / (1 - Math.cos(this._angle)) * this._spotData[0];
  }


  _updateFalloffData() {
    this._falloffData[0] = -this._falloffCurve;
    this._falloffData[1] = -1 + this._falloffCurve;
    this._falloffData[2] = 1 / this._radius;
  }
  
}

export default SpotLight;