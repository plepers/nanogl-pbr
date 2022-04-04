import Node from 'nanogl-node';
import Texture2D from 'nanogl/texture-2d';
import { mat4 } from 'gl-matrix';
import { GLContext } from 'nanogl/types';
import Camera from 'nanogl-camera';
import Bounds from '../Bounds';
import LightType from './LightType';
export default abstract class Light extends Node {
    abstract readonly _type: LightType;
    constructor();
}
export declare function lightIsShadowMappedLight(light: Light): light is ShadowMappedLight;
export interface ShadowMappedLight extends Light {
    castShadows: boolean;
    shadowmapSize: number;
    projectionFromBounds(bounds: Bounds): void;
    initShadowmap(gl: GLContext): void;
    getShadowmap(): Texture2D | null;
    bindShadowmap(): void;
    hasDepthShadowmap(): boolean;
    getTexelBiasVector(): Float32Array;
    getCamera(): Camera;
    getShadowProjection(bounds: Bounds): mat4;
}
