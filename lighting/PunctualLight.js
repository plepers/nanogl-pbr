import Light from "./Light";
import Fbo from "nanogl/fbo";
import { isWebgl2 } from "nanogl/types";
import Texture2D from "nanogl/texture-2d";
import { mat4, vec3 } from "gl-matrix";
import PixelFormats from "nanogl-pf";
const ScreenMtx = new Float32Array([
    0.5, 0, 0, 0,
    0, 0.5, 0, 0,
    0, 0, 0.5, 0,
    .5, .5, .5, 1
]);
const LightMtx = mat4.create();
const V6 = new Float32Array(6);
const V3 = vec3.create();
const GL_DEPTH_ATTACHMENT = 0x8D00;
const GL_COLOR_ATTACHMENT0 = 0x8CE0;
export default class PunctualLight extends Light {
    constructor() {
        super();
        this._color = new Float32Array([1.0, 1.0, 1.0]);
        this._wdir = new Float32Array(this._wmatrix.buffer, 8 * 4, 3);
        this._castShadows = false;
        this._fbo = null;
        this._camera = null;
        this._shadowmapSize = 512;
        this.iblShadowing = .5;
    }
    castShadows(flag) {
        if (this._castShadows !== flag) {
            this._castShadows = flag;
            if (!flag)
                this._releaseShadowMapping();
        }
    }
    hasDepthShadowmap() {
        return this._castShadows && this._fbo.getAttachment(GL_DEPTH_ATTACHMENT).isTexture();
    }
    getShadowmap(gl) {
        if (this._castShadows) {
            if (this._fbo === null) {
                this._initShadowMapping(gl);
            }
            var att = this._fbo.getAttachment(gl.DEPTH_ATTACHMENT);
            if (att !== null) {
                const tgt = att.isTexture() ? att.target : this._fbo.getAttachment(GL_COLOR_ATTACHMENT0).target;
                return tgt;
            }
        }
        return null;
    }
    getShadowmapSize() {
        return this._shadowmapSize;
    }
    prepareShadowmap() {
        const s = this._shadowmapSize;
        const fbo = this._fbo;
        fbo.resize(s, s);
        fbo.bind();
        fbo.defaultViewport();
    }
    getShadowProjection(bounds) {
        this.projectionFromBounds(bounds);
        this._camera.updateViewProjectionMatrix(1, 1);
        mat4.multiply(LightMtx, ScreenMtx, this._camera._viewProj);
        return LightMtx;
    }
    _initShadowMapping(gl) {
        var s = this._shadowmapSize;
        this._fbo = new Fbo(gl);
        this._fbo.bind();
        this._fbo.resize(s, s);
        this._fbo.attach(gl.COLOR_ATTACHMENT0, new Texture2D(gl, gl.RGB));
        var hasDTex = PixelFormats.getInstance(gl).hasDepthTexture();
        const att = this._fbo.attachDepth(true, false, hasDTex);
        var smap = (att.isTexture() ? att.target : this._fbo.getAttachment(GL_COLOR_ATTACHMENT0).target);
        smap.bind();
        if (isWebgl2(gl)) {
            smap.setFilter(true, false, false);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        }
        else {
            smap.setFilter(false, false, false);
        }
        this._camera = this._createCamera();
        this.add(this._camera);
    }
    _releaseShadowMapping() {
        this._fbo.dispose();
        this._fbo = null;
        this.remove(this._camera);
        this._camera = null;
    }
    boundsInLocalSpace(bounds) {
        V6[0] = V6[1] = V6[2] = Number.MAX_VALUE;
        V6[3] = V6[4] = V6[5] = -Number.MAX_VALUE;
        for (var bCorner = 0; 8 > bCorner; bCorner++) {
            V3[0] = (bCorner & 1) ? bounds.max[0] : bounds.min[0];
            V3[1] = (bCorner & 2) ? bounds.max[1] : bounds.min[1];
            V3[2] = (bCorner & 4) ? bounds.max[2] : bounds.min[2];
            vec3.transformMat4(V3, V3, this._camera._view);
            V6[0] = Math.min(V6[0], V3[0]);
            V6[1] = Math.min(V6[1], V3[1]);
            V6[2] = Math.min(V6[2], V3[2]);
            V6[3] = Math.max(V6[3], V3[0]);
            V6[4] = Math.max(V6[4], V3[1]);
            V6[5] = Math.max(V6[5], V3[2]);
        }
        return V6;
    }
}
