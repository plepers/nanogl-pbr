import { mat3, vec2 } from "gl-matrix";
import Chunk from "./Chunk";
import Input, { Uniform } from "./Input";
import code from './glsl/templates/texCoord.glsl';
const EPSILON = 0.000001;
const M3_IDENTITY = mat3.create();
function almostZero(f) {
    return Math.abs(f) < EPSILON;
}
function noTranslate(v) {
    return almostZero(v[0]) && almostZero(v[1]);
}
function noScale(v) {
    return almostZero(v[0] - 1) && almostZero(v[1] - 1);
}
const M2 = new Float32Array(4);
function composeMat2(scale, r) {
    const cos = Math.cos(r);
    const sin = Math.sin(r);
    M2[0] = scale[0] * cos;
    M2[1] = scale[0] * -sin;
    M2[2] = scale[1] * sin;
    M2[3] = scale[1] * cos;
    return M2;
}
function mat3Equals(m1, m2) {
    return (almostZero(m1[0] - m2[0]) &&
        almostZero(m1[1] - m2[1]) &&
        almostZero(m1[3] - m2[3]) &&
        almostZero(m1[4] - m2[4]) &&
        almostZero(m1[6] - m2[6]) &&
        almostZero(m1[7] - m2[7]));
}
export class TexCoordTransform extends Chunk {
    constructor(attrib, hasSetup) {
        super(true, hasSetup);
        this._translation = vec2.create();
        this._scale = vec2.create();
        this._rotation = 0;
        this._uid = `${TexCoordTransform._UID++}`;
        this.attrib = attrib;
        this._translateInput = this.addChild(new Input(`tct_t_${this._uid}`, 2, Input.VERTEX));
        this._rotateScalesInput = this.addChild(new Input(`tct_rs_${this._uid}`, 4, Input.VERTEX));
    }
    _genCode(slots) {
        const varying = this.varying();
        slots.add('pf', code({ declare_fragment_varying: true, varying }));
        slots.add('pv', code({ declare_vertex_varying: true, varying }));
        slots.add('v', code({ vertex_body: true, uid: this._uid, varying, attrib: this.attrib }));
    }
    varying() {
        return `vTexCoord_tct${this._uid}`;
    }
    _getHash() {
        return this.varying();
    }
    decomposeMatrix(m) {
        this._translation[0] = m[6];
        this._translation[1] = m[7];
        this._scale[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        this._scale[1] = Math.sqrt(m[3] * m[3] + m[4] * m[4]);
        this._rotation = Math.atan2(m[1], m[0]);
        this.updateTransform();
    }
}
TexCoordTransform._UID = 0;
export class DynamicTexCoordTransform extends TexCoordTransform {
    constructor(attrib) {
        super(attrib, true);
        this._translateUniform = new Uniform(`tct_ut_${this._uid}`, 2);
        this._rotationScaleUniform = new Uniform(`tct_urs_${this._uid}`, 4);
    }
    translate(x, y) {
        this._translation[0] = x;
        this._translation[1] = y;
        this.updateTransform();
        return this;
    }
    rotate(rad) {
        this._rotation = rad;
        this.updateTransform();
        return this;
    }
    scale(x, y = x) {
        this._scale[0] = x;
        this._scale[1] = y;
        this.updateTransform();
        return this;
    }
    setMatrix(m) {
        this.decomposeMatrix(m);
    }
    updateTransform() {
        if (noTranslate(this._translation)) {
            this._translateInput.detach();
        }
        else {
            this._translateInput.attach(this._translateUniform);
            this._translateUniform.set(...this._translation);
        }
        if (noScale(this._scale) && almostZero(this._rotation)) {
            this._rotateScalesInput.detach();
        }
        else {
            this._rotateScalesInput.attach(this._rotationScaleUniform);
            this._rotationScaleUniform.set(...composeMat2(this._scale, this._rotation));
        }
    }
}
export class StaticTexCoordTransform extends TexCoordTransform {
    constructor(attrib, matrix) {
        super(attrib, false);
        this._matrix = mat3.copy(mat3.create(), matrix);
        this.decomposeMatrix(matrix);
    }
    updateTransform() {
        if (noTranslate(this._translation)) {
            this._translateInput.detach();
        }
        else {
            this._translateInput.attachConstant(this._translation);
        }
        if (noScale(this._scale) && almostZero(this._rotation)) {
            this._rotateScalesInput.detach();
        }
        else {
            this._rotateScalesInput.attachConstant(composeMat2(this._scale, this._rotation));
        }
    }
    equalMatrix(m) {
        return mat3Equals(m, this._matrix);
    }
}
export default class TexCoord extends Chunk {
    constructor(attrib = 'aTexCoord0') {
        super(true, false);
        this._statics = [];
        this._identity = null;
        this.attrib = attrib;
    }
    addTransform() {
        const tct = new DynamicTexCoordTransform(this.attrib);
        this.addChild(tct);
        return tct;
    }
    addStaticTransform(matrix) {
        const matchTct = this.getStaticTransform(matrix);
        if (matchTct !== null)
            return matchTct;
        const tct = new StaticTexCoordTransform(this.attrib, matrix);
        this.addChild(tct);
        this._statics.push(tct);
        return tct;
    }
    varying() {
        if (this._identity === null) {
            this._identity = this.addStaticTransform(M3_IDENTITY);
        }
        return this._identity.varying();
    }
    getStaticTransform(matrix) {
        for (const tct of this._statics) {
            if (tct.equalMatrix(matrix)) {
                return tct;
            }
        }
        return null;
    }
    _genCode(slots) {
        slots.add('pv', code({ declare_attribute: true, attrib: this.attrib }));
    }
    _getHash() {
        return `_tc_${this.attrib}`;
    }
}
