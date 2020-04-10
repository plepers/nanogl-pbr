import Node from 'nanogl-node';
import Texture2D from 'nanogl/texture-2d';
import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Camera from 'nanogl-camera';
import Bounds from '../Bounds';
import LightType from './LightType';
declare abstract class Light extends Node {
    abstract readonly _type: LightType;
    constructor();
}
export interface ShadowMappedLight {
    projectionFromBounds(bounds: Bounds): void;
    getShadowmap(gl: GLContext): Texture2D | null;
    prepareShadowmap(): void;
    hasDepthShadowmap(): boolean;
    getTexelBiasVector(): Float32Array;
    _createCamera(): Camera;
    getShadowProjection(bounds: Bounds): mat4;
    getShadowmapSize(): number;
}
export default Light;
