import Chunk from './Chunk';
import { hashString, stringifyHash } from './Hash';
import TexCoord from './TexCoord';
import { ColorSpace } from './ColorSpace';
const TYPES = [
    null,
    'float',
    'vec2',
    'vec3',
    'vec4'
];
export var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["FRAGMENT"] = 1] = "FRAGMENT";
    ShaderType[ShaderType["VERTEX"] = 2] = "VERTEX";
    ShaderType[ShaderType["ALL"] = 3] = "ALL";
})(ShaderType || (ShaderType = {}));
function _trimComps(comps, size) {
    const l = comps.length;
    if (l === size) {
        return comps;
    }
    if (l > size) {
        return comps.substr(0, size);
    }
    const last = comps[l - 1];
    while (comps.length < size) {
        comps = (comps + last);
    }
    return comps;
}
function _floatStr(n) {
    return n.toPrecision(8);
}
function _addCode(slots, type, code) {
    if ((type & ShaderType.FRAGMENT) !== 0) {
        slots.add('f', code);
    }
    if ((type & ShaderType.VERTEX) !== 0) {
        slots.add('v', code);
    }
}
function _addPreCode(slots, type, code) {
    if ((type & ShaderType.FRAGMENT) !== 0) {
        slots.add('pf', code);
    }
    if ((type & ShaderType.VERTEX) !== 0) {
        slots.add('pv', code);
    }
}
var ParamType;
(function (ParamType) {
    ParamType[ParamType["SAMPLER"] = 0] = "SAMPLER";
    ParamType[ParamType["UNIFORM"] = 1] = "UNIFORM";
    ParamType[ParamType["ATTRIBUTE"] = 2] = "ATTRIBUTE";
    ParamType[ParamType["CONSTANT"] = 3] = "CONSTANT";
})(ParamType || (ParamType = {}));
export class BaseParams extends Chunk {
    constructor(hasCode = false, hasSetup = false) {
        super(hasCode, hasSetup);
        this._colorspace = ColorSpace.AUTO;
    }
    set colorspace(c) {
        if (this._colorspace !== c) {
            this._colorspace = c;
            this.invalidateCode();
        }
    }
    get colorspace() {
        return this._colorspace;
    }
}
export class Sampler extends BaseParams {
    constructor(name, texCoords = TexCoord.create(), colorspace = ColorSpace.AUTO) {
        super(true, true);
        this.ptype = ParamType.SAMPLER;
        this.name = name;
        this._tex = null;
        this.size = 4;
        this._colorspace = colorspace;
        if (typeof texCoords === 'string') {
            this.texCoords = texCoords;
            this._varying = texCoords;
        }
        else {
            this.texCoords = texCoords;
            this.addChild(this.texCoords);
            this._varying = texCoords.varying();
        }
        this.token = `VAL_${this.name}${this._varying}`;
    }
    set(t) {
        this._tex = t;
    }
    _genCode(slots) { }
    genInputCode(slots, input) {
        let c;
        c = `uniform sampler2D ${this.name};\n`;
        _addPreCode(slots, input.shader, c);
        c = `vec4 ${this.token} = texture2D( ${this.name}, ${this._varying});\n`;
        c += Sampler.colorSpaceTransformCode(this._colorspace, input.colorspace, `${this.token}.rgb`);
        _addCode(slots, input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._tex);
    }
    static colorSpaceTransformCode(from, to, v) {
        if (from === ColorSpace.LINEAR && to === ColorSpace.SRGB) {
            return `${v} = sqrt(${v});`;
        }
        if (from === ColorSpace.SRGB && to === ColorSpace.LINEAR) {
            return `${v} = ${v}*${v};`;
        }
        return '';
    }
}
export class Uniform extends BaseParams {
    get value() {
        return this._value;
    }
    set x(v) { this._value[0] = v; }
    set y(v) { this._value[1] = v; }
    set z(v) { this._value[2] = v; }
    set w(v) { this._value[3] = v; }
    get x() { return this._value[0]; }
    get y() { return this._value[1]; }
    get z() { return this._value[2]; }
    get w() { return this._value[3]; }
    constructor(name, size) {
        super(true, true);
        this.ptype = ParamType.UNIFORM;
        this.name = name;
        this.size = size;
        this._value = new Float32Array(size);
        this.token = 'VAL_' + this.name;
    }
    set(...args) {
        for (var i = 0; i < args.length; i++) {
            this._value[i] = args[i];
        }
        this._invalid = true;
    }
    _genCode(slots) { }
    genInputCode(slots, input) {
        let c = `uniform ${TYPES[this.size]} ${this.name};\n`;
        c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, this.name);
        _addPreCode(slots, input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._value);
        this._invalid = false;
    }
    static colorSpaceTransformCode(from, to, d, v) {
        if (from === ColorSpace.LINEAR && to === ColorSpace.SRGB) {
            return `#define ${d} sqrt(${v})`;
        }
        if (from === ColorSpace.SRGB && to === ColorSpace.LINEAR) {
            return `#define ${d} (${v}*${v})`;
        }
        return `#define ${d} ${v}`;
    }
}
export class Attribute extends BaseParams {
    constructor(name, size) {
        super(true, false);
        this.ptype = ParamType.ATTRIBUTE;
        this.name = name;
        this.size = size;
        this.token = `v_${this.name}`;
    }
    _genCode(slots) { }
    genInputCode(slots, input) {
        var c;
        const typeId = TYPES[this.size];
        c = `IN ${typeId} ${this.token};\n`;
        slots.add('pf', c);
        c = `IN ${typeId} ${this.name};\n`;
        c += `OUT ${typeId} ${this.token};\n`;
        slots.add('pv', c);
        c = `${this.token} = ${this.name};\n`;
        slots.add('v', c);
    }
}
export class Constant extends BaseParams {
    constructor(value) {
        super(true, false);
        this.ptype = ParamType.CONSTANT;
        this.name = '';
        this.size = 1;
        this.token = '';
        this.value = 0;
        this._hash = 0;
        this.set(value);
    }
    set(value) {
        if (typeof value === 'number') {
            this.size = 1;
            this.value = value;
        }
        else {
            this.size = value.length;
            this.value = Array.from(value);
        }
        const hash = this._hash;
        this._hash = hashString(`${this.size}-${this._stringifyValue()}`);
        this.name = `CONST_${stringifyHash(this._hash)}`;
        this.token = `VAR_${this.name}`;
        if (hash !== this._hash) {
            this.invalidateCode();
        }
    }
    _genCode(slots) { }
    genInputCode(slots, input) {
        let c = `#define RAW_${this.token} ${TYPES[this.size]}(${this._stringifyValue()})\n`;
        c += Uniform.colorSpaceTransformCode(this._colorspace, input.colorspace, this.token, 'RAW_' + this.token);
        _addPreCode(slots, input.shader, c);
    }
    _stringifyValue() {
        if (this.size === 1) {
            return this.value.toString();
        }
        else {
            const a = this.value;
            return a.map(_floatStr).join(',');
        }
    }
}
export default class Input extends Chunk {
    constructor(name, size, shader = ShaderType.FRAGMENT, colorspace = ColorSpace.LINEAR) {
        super(true, false);
        this._colorspace = ColorSpace.LINEAR;
        this.name = name;
        this.size = size;
        this.param = null;
        this.comps = _trimComps('rgba', size);
        this.shader = shader;
        this.colorspace = colorspace;
    }
    set colorspace(c) {
        if (this._colorspace !== c) {
            this._colorspace = c;
            this.invalidateCode();
        }
    }
    get colorspace() {
        return this._colorspace;
    }
    attach(param, comps = 'rgba') {
        if (this.param) {
            this.removeChild(this.param);
        }
        this.param = param;
        if (param !== null) {
            this.comps = _trimComps(comps, this.size);
            this.addChild(param);
        }
    }
    detach() {
        if (this.param !== null) {
            this.removeChild(this.param);
        }
        this.param = null;
    }
    attachSampler(name = `T${this.name}`, texCoords = TexCoord.create(), comps = 'rgba') {
        const p = new Sampler(name, texCoords);
        this.attach(p, comps);
        return p;
    }
    attachUniform(name = `U${this.name}`, size = this.size, comps = 'rgba') {
        const p = new Uniform(name, size);
        this.attach(p, comps);
        return p;
    }
    attachAttribute(name = `A${this.name}`, size = this.size, comps = 'rgba') {
        const p = new Attribute(name, size);
        this.attach(p, comps);
        return p;
    }
    attachConstant(value, comps = 'rgba') {
        const p = new Constant(value);
        this.attach(p, comps);
        return p;
    }
    _genCode(slots) {
        var _a;
        (_a = this.param) === null || _a === void 0 ? void 0 : _a.genInputCode(slots, this);
        const val = (this.param === null) ? '0' : '1';
        const def = `#define HAS_${this.name} ${val}\n`;
        slots.add('definitions', def);
        if (this.param !== null) {
            var c = `#define ${this.name}(k) ${this.param.token}`;
            if (this.param.size > 1) {
                c += `.${this.comps}`;
            }
            _addPreCode(slots, this.shader, c);
            if (this.param.ptype === ParamType.SAMPLER) {
                var c = `#define ${this.name}_texCoord(k) ${this.param._varying}`;
                _addPreCode(slots, this.shader, c);
            }
        }
    }
}
Input.Sampler = Sampler;
Input.Uniform = Uniform;
Input.Attribute = Attribute;
Input.Constant = Constant;
Input.FRAGMENT = ShaderType.FRAGMENT;
Input.VERTEX = ShaderType.VERTEX;
Input.ALL = ShaderType.ALL;
