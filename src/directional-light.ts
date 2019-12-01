import Light from './light'
import Camera from 'nanogl-camera'
import { GLContext } from 'nanogl/types';
import LightType from './light-types'
import Bounds from './bounds'
import OrthographicLens from 'nanogl-camera/ortho-lens'



const BiasVector = new Float32Array(4);


class DirectionalLight extends Light {

  _shadowmapNearOffset: number;

  _camera: Camera<OrthographicLens>|null = null;
  

  constructor( gl: GLContext ) {
    super( gl );
    this._type = LightType.DIRECTIONAL;
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