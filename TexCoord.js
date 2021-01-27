import { mat3 } from "gl-matrix";
import Chunk from "./Chunk";
import Input, { Uniform } from "./Input";
import { hashString, hashView, stringifyHash, mergeHash } from "./Hash";
const EPSILON = 0.000001;
const M3 = mat3.create();
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
function fromTRS(res, translation, rotation, scale) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    res[0] = scale[0] * cos;
    res[1] = scale[0] * -sin;
    res[3] = scale[1] * sin;
    res[4] = scale[1] * cos;
    res[6] = translation[0];
    res[7] = translation[0];
    res[2] = 0;
    res[5] = 0;
    res[8] = 0;
}
const _DefaultTexCoord = 'aTexCoord0';
const GLSL = {
    declareIn(name) {
        return `IN mediump vec2 ${name};`;
    },
    declareOut(name) {
        return `OUT mediump vec2 ${name};`;
    },
    transformCode(tc, tSource, rsSource) {
        let tattrib = tc.attrib;
        if (rsSource !== undefined)
            tattrib = `mat2( ${rsSource}() ) * ${tattrib}`;
        if (tSource !== undefined)
            tattrib = `${tattrib} + ${tSource}()`;
        return `${tc.varying()} = ${tattrib};`;
    }
};
class TexCoordTransform {
    constructor() {
        this.buffer = new Float32Array(5);
        this.translation = new Float32Array(this.buffer.buffer, 0, 2);
        this.scale = new Float32Array(this.buffer.buffer, 8, 2);
        this.rotation = new Float32Array(this.buffer.buffer, 16, 1);
    }
    decomposeMatrix(m) {
        this.translation[0] = m[6];
        this.translation[1] = m[7];
        this.scale[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        this.scale[1] = Math.sqrt(m[3] * m[3] + m[4] * m[4]);
        this.rotation[0] = Math.atan2(m[1], m[0]);
    }
    composeMat2() {
        const cos = Math.cos(this.rotation[0]);
        const sin = Math.sin(this.rotation[0]);
        M2[0] = this.scale[0] * cos;
        M2[1] = this.scale[0] * -sin;
        M2[2] = this.scale[1] * sin;
        M2[3] = this.scale[1] * cos;
        return M2;
    }
    getTransformHash() {
        return hashView(this.buffer);
    }
}
class TexCoord extends Chunk {
    constructor(attrib = _DefaultTexCoord, hasSetup) {
        super(true, hasSetup);
        this._uid = '';
        this.attrib = attrib;
        this._transform = new TexCoordTransform();
    }
    static create(attrib) {
        return new StaticTexCoord(attrib, M3_IDENTITY);
    }
    static createTransformed(attrib, matrix = M3_IDENTITY) {
        return new StaticTexCoord(attrib, matrix);
    }
    static createFromTRS(attrib, trsOpt = {}) {
        var _a, _b, _c;
        const t = (_a = trsOpt.translation) !== null && _a !== void 0 ? _a : [0, 0];
        const r = (_b = trsOpt.rotation) !== null && _b !== void 0 ? _b : 0;
        const s = (_c = trsOpt.scale) !== null && _c !== void 0 ? _c : 0;
        fromTRS(M3, t, r, [s, s]);
        return new StaticTexCoord(attrib, M3);
    }
    static createTransformedDynamic(attrib) {
        return new DynamicTexCoord(attrib);
    }
    _genCode(slots) {
        slots.add('pf', GLSL.declareIn(this.varying()));
        slots.add('pv', GLSL.declareOut(this.varying()));
        slots.add('pv', GLSL.declareIn(this.attrib));
        slots.add('v', this.getTransformCode());
    }
}
let DynamicTexCoord = (() => {
    class DynamicTexCoord extends TexCoord {
        constructor(attrib = _DefaultTexCoord) {
            super(attrib, true);
            this._uid = `${DynamicTexCoord._UID++}`;
            this._translateInput = this.addChild(new Input(`tct_t_${this._uid}`, 2, Input.VERTEX));
            this._rotateScalesInput = this.addChild(new Input(`tct_rs_${this._uid}`, 4, Input.VERTEX));
            this._translateUniform = new Uniform(`tct_ut_${this._uid}`, 2);
            this._rotationScaleUniform = new Uniform(`tct_urs_${this._uid}`, 4);
            this._translateInput.attach(this._translateUniform);
            this._rotateScalesInput.attach(this._rotationScaleUniform);
        }
        varying() {
            return `vTexCoord_dtt${this._uid}`;
        }
        getTransformCode() {
            return GLSL.transformCode(this, this._translateInput.name, this._rotateScalesInput.name);
        }
        translate(x, y) {
            this._transform.translation[0] = x;
            this._transform.translation[1] = y;
            this.updateTransform();
            return this;
        }
        rotate(rad) {
            this._transform.rotation[0] = rad;
            this.updateTransform();
            return this;
        }
        scale(x, y = x) {
            this._transform.scale[0] = x;
            this._transform.scale[1] = y;
            this.updateTransform();
            return this;
        }
        setMatrix(m) {
            this._transform.decomposeMatrix(m);
            this.updateTransform();
        }
        updateTransform() {
            this._translateUniform.set(...this._transform.translation);
            this._rotationScaleUniform.set(...this._transform.composeMat2());
        }
    }
    DynamicTexCoord._UID = 0;
    return DynamicTexCoord;
})();
export { DynamicTexCoord };
export class StaticTexCoord extends TexCoord {
    constructor(attrib = _DefaultTexCoord, matrix) {
        super(attrib, false);
        this._transform.decomposeMatrix(matrix);
        const thash = stringifyHash(this._transform.getTransformHash());
        if (!noTranslate(this._transform.translation)) {
            const input = new Input(`tct_t_${thash}`, 2, Input.VERTEX);
            this._translateInput = input;
            this._translateConst = input.attachConstant(this._transform.translation);
            this.addChild(input);
        }
        if (!noScale(this._transform.scale) || !almostZero(this._transform.rotation[0])) {
            const input = new Input(`tct_rs_${thash}`, 4, Input.VERTEX);
            this._rotateScalesInput = input;
            this._rotateScalesConst = input.attachConstant(this._transform.composeMat2());
            this.addChild(input);
        }
    }
    varying() {
        const hash = mergeHash(hashString(this.attrib), this._transform.getTransformHash());
        return `vTexCoord_${stringifyHash(hash)}`;
    }
    getTransformCode() {
        var _a, _b;
        return GLSL.transformCode(this, (_a = this._translateInput) === null || _a === void 0 ? void 0 : _a.name, (_b = this._rotateScalesInput) === null || _b === void 0 ? void 0 : _b.name);
    }
}
export default TexCoord;
