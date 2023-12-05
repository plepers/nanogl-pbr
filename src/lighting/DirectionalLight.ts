import { ShadowMappedLight } from './Light'
import Camera from 'nanogl-camera'
import LightType from './LightType'
import Bounds from '../Bounds'
import OrthographicLens from 'nanogl-camera/ortho-lens'
import PunctualLight from './PunctualLight';



const BiasVector = new Float32Array(4);

/**
 * This class manages directional lights.
 */
class DirectionalLight extends PunctualLight implements ShadowMappedLight {

  readonly _type = LightType.DIRECTIONAL;

  /**
   * The amount to offset the camera near when projecting shadow map
   * @defaultValue 0
   */
  _shadowmapNearOffset: number;

  _camera: Camera<OrthographicLens>|null = null;


  constructor() {
    super();
    this._shadowmapNearOffset = 0;
  }


  projectionFromBounds( bounds: Bounds ) {
    const oBounds = this.boundsInLocalSpace(bounds);
    const camera = this._camera!;
    camera.lens.near = -oBounds[5] - this._shadowmapNearOffset;
    camera.lens.far  = -oBounds[2];
    camera.lens.setBound( oBounds[0], oBounds[3], oBounds[1], oBounds[4] );
  }


  getTexelBiasVector() : Float32Array {
    const ortho = this._camera!.lens;
    BiasVector[3] = Math.max(ortho._xMax - ortho._xMin, ortho._yMax - ortho._yMin);
    return BiasVector;
  }


  _createCamera() : Camera<OrthographicLens> {
    return Camera.makeOrthoCamera();
  }

}


export default DirectionalLight