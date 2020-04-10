import Light from "./Light";
import Fbo from "nanogl/fbo";
import Camera from "nanogl-camera";
import { GLContext } from "nanogl/types";
import Texture2D from "nanogl/texture-2d";
import { mat4 } from "gl-matrix";
import Bounds from "../Bounds";
export default abstract class PunctualLight extends Light {
    _color: Float32Array;
    _wdir: Float32Array;
    _castShadows: boolean;
    _fbo: Fbo | null;
    _camera: Camera | null;
    iblShadowing: number;
    _shadowmapSize: number;
    constructor();
    castShadows(flag: boolean): void;
    hasDepthShadowmap(): boolean;
    getShadowmap(gl: GLContext): Texture2D | null;
    getShadowmapSize(): number;
    prepareShadowmap(): void;
    getShadowProjection(bounds: Bounds): mat4;
    protected _initShadowMapping(gl: GLContext): void;
    protected _releaseShadowMapping(): void;
    abstract projectionFromBounds(bounds: Bounds): void;
    abstract getTexelBiasVector(): Float32Array;
    abstract _createCamera(): Camera;
    boundsInLocalSpace(bounds: Bounds): Float32Array;
}
