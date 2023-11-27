import Light, { ShadowMappedLight } from './Light'
import Camera from 'nanogl-camera'
import LightType from './LightType'
import Bounds from '../Bounds'
import { GLContext } from 'nanogl/types';
import PerspectiveLens from 'nanogl-camera/perspective-lens'
import PunctualLight from './PunctualLight';

const BiasVector = new Float32Array(4);


/**
 * This class manages spot lights.
 */
class SpotLight extends PunctualLight implements ShadowMappedLight{

  readonly _type = LightType.SPOT;

  /** The inner angle of the spot light */
  private _innerAngle: number = 0;
  /** The outer angle of the spot light */
  private _outerAngle: number = 0;
  /** The radius of the spot light */
  private _radius: number = 0;

  // x : 1.0 / radius^2
  /** The computed attenuation data of the spot light */
  _attenuationData   : Float32Array;

  _camera: Camera<PerspectiveLens>|null = null;


  constructor() {
    super();

    this._attenuationData    = new Float32Array(4);

    this.outerAngle = Math.PI / 4;
    this.radius = 50.0;
  }


  projectionFromBounds( bounds: Bounds ) : void{

    const oBounds = this.boundsInLocalSpace(bounds);
    let zMin = -oBounds[5],
        zMax = -oBounds[2];

    const rRadius = (this._radius<=0)?Number.MAX_VALUE:this._radius;
    zMin = Math.max( 0.001, Math.min(zMin, rRadius ) );
    zMax = Math.max(0.005 + zMin, Math.min(zMax, rRadius ));

    const lens = this._camera!.lens;
    lens.near = zMin;
    lens.far  = zMax;
  }


  getTexelBiasVector() {
    var mtx = this._camera!._view;
    var zMin = -2.0 * Math.tan(this._outerAngle);
    BiasVector[0] = mtx[2]  * zMin;
    BiasVector[1] = mtx[6]  * zMin;
    BiasVector[2] = mtx[10] * zMin;
    BiasVector[3] = mtx[14] * zMin;
    return BiasVector;
  }


  _createCamera() : Camera<PerspectiveLens> {
    var cam = Camera.makePerspectiveCamera();
    cam.lens.aspect = 1;
    cam.lens.fov = this._outerAngle*2.0;
    cam.lens.near = 15 - 5
    cam.lens.far = 15 + 5
    return cam;
  }


  /**
   * Get the inner angle of the spot light.
   */
  get innerAngle() { return this._innerAngle; }
  /**
   * Set the inner angle of the spot light.
   * This will also update the attenuation data.
   * @param {number} v The new value
   */
  set innerAngle( v :number ) {
    this._innerAngle = v;
    this._updateSpotData();
  }

  /**
   * Get the outer angle of the spot light.
   */
  get angle(){ return this._outerAngle; }
  /**
   * Set the outer angle of the spot light.
   * This will not update the attenuation data.
   * @param {number} v The new value
   */
  set angle(v:number){ this.outerAngle=v; }

  /**
   * Get the outer angle of the spot light.
   */
  get outerAngle() { return this._outerAngle; }
  /**
   * Set the outer angle of the spot light.
   * This will also update the attenuation data
   * and adjust the camera fov if the light casts shadows.
   * @param {number} v The new value
   */
  set outerAngle( v :number ) {
    this._outerAngle = v;
    this._updateSpotData();
    if (this.castShadows) {
      this._camera!.lens.fov = this._outerAngle*2.0;
    }
  }


  /**
   * Get the radius of the spot light.
   */
  get radius() { return this._radius }
  /**
   * Set the radius of the spot light.
   * This will also update the attenuation data.
   * @param {number} v The new value
   */
  set radius( v : number ) {
    this._radius = v;
    this._updateSpotData();
  }


  /**
   * Update the attenuation data of the spot light.
   */
  _updateSpotData() {
    this._attenuationData[0] = 1.0 / (this._radius * this._radius);
    this._attenuationData[1] = (this._radius * this._radius);
    this._attenuationData[2] = 1.0 / Math.max(0.001, Math.cos(this._innerAngle) - Math.cos(this._outerAngle));
    this._attenuationData[3] = -Math.cos(this._outerAngle) * this._attenuationData[2];
  }



}

export default SpotLight;