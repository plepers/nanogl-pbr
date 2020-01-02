import Chunk from './Chunk';
const TYPES = [
    null,
    'float',
    'vec2',
    'vec3',
    'vec4'
];
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
    if ((type & 1) !== 0) {
        slots.add('f', code);
    }
    if ((type & 2) !== 0) {
        slots.add('v', code);
    }
}
function _addPreCode(slots, type, code) {
    if ((type & 1) !== 0) {
        slots.add('pf', code);
    }
    if ((type & 2) !== 0) {
        slots.add('pv', code);
    }
}
function isAttribute(x) {
    return x instanceof Attribute;
}
export class Sampler extends Chunk {
    constructor(name, texCoords) {
        super(true, true);
        this._input = null;
        this.name = name;
        this.texCoords = texCoords;
        this._tex = null;
        this.size = 4;
        if (isAttribute(texCoords)) {
            this._linkAttrib = true;
            this.addChild(texCoords);
            this.uvsToken = texCoords.token;
        }
        else {
            this._linkAttrib = false;
            this.uvsToken = texCoords;
        }
        this.token = `VAL_${this.name}${this.uvsToken}`;
    }
    set(t) {
        this._tex = t;
    }
    _genCode(slots) {
        if (this._input == null)
            return;
        var name = this.name, c;
        c = `uniform sampler2D ${name};\n`;
        _addPreCode(slots, this._input.shader, c);
        c = `vec4 ${this.token} = texture2D( ${name}, ${this.uvsToken});\n`;
        _addCode(slots, this._input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._tex);
    }
    _getHash() {
        return `${this._linkAttrib ? '' : this.texCoords}-${this.name}`;
    }
}
export class Uniform extends Chunk {
    constructor(name, size) {
        super(true, true);
        this._input = null;
        this.name = name;
        this.size = size;
        this._value = new Float32Array(size);
        this.token = this.name;
    }
    set(...args) {
        for (var i = 0; i < args.length; i++) {
            this._value[i] = args[i];
        }
        this._invalid = true;
    }
    _genCode(slots) {
        if (this._input === null)
            return;
        var c;
        c = `uniform ${TYPES[this.size]} ${this.token};\n`;
        _addPreCode(slots, this._input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._value);
        this._invalid = false;
    }
    _getHash() {
        return `${this.size}-${this.name}`;
    }
}
export class Attribute extends Chunk {
    constructor(name, size) {
        super(true, false);
        this._input = null;
        this.name = name;
        this.size = size;
        this.token = `v_${this.name}`;
    }
    _genCode(slots) {
        var c;
        const typeId = TYPES[this.size];
        c = `varying ${typeId} ${this.token};\n`;
        slots.add('pf', c);
        c = `attribute ${typeId} ${this.name};\n`;
        c += `varying   ${typeId} ${this.token};\n`;
        slots.add('pv', c);
        c = `${this.token} = ${this.name};\n`;
        slots.add('v', c);
    }
    _getHash() {
        return `${this.size}-${this.name}`;
    }
}
export class Constant extends Chunk {
    constructor(value) {
        super(true, false);
        this._input = null;
        this.name = `CONST_${(0 | (Math.random() * 0x7FFFFFFF)).toString(16)}`;
        if (Array.isArray(value)) {
            this.size = value.length;
        }
        else {
            this.size = 1;
        }
        this.value = value;
        this.token = `VAR_${this.name}`;
    }
    _genCode(slots) {
        if (this._input === null)
            return;
        var c;
        c = `#define ${this.token} ${TYPES[this.size]}(${this._stringifyValue()})\n`;
        _addPreCode(slots, this._input.shader, c);
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
    _getHash() {
        return `${this._stringifyValue()}-${this.size}-`;
    }
}
export default class Input extends Chunk {
    constructor(name, size, shader = 1) {
        super(true, false);
        this.name = name;
        this.size = size;
        this.param = null;
        this.comps = _trimComps('rgba', size);
        this.shader = shader;
    }
    attach(param, comps = 'rgba') {
        if (this.param) {
            this.removeChild(this.param);
        }
        param._input = this;
        this.param = param;
        this.addChild(param);
        this.comps = _trimComps(comps, this.size);
    }
    detach() {
        if (this.param !== null) {
            this.param._input = null;
            this.removeChild(this.param);
        }
        this.param = null;
    }
    attachSampler(name, texCoords, comps = 'rgba') {
        var p = new Sampler(name, texCoords);
        this.attach(p, comps);
        return p;
    }
    attachUniform(name, size = this.size, comps = 'rgba') {
        var p = new Uniform(name, size);
        this.attach(p, comps);
        return p;
    }
    attachAttribute(name, size = this.size, comps = 'rgba') {
        var p = new Attribute(name, size);
        this.attach(p, comps);
        return p;
    }
    attachConstant(value, comps = 'rgba') {
        var p = new Constant(value);
        this.attach(p, comps);
        return p;
    }
    _getHash() {
        var hash = `${this.size}-${this.comps}-${this.name}`;
        return hash;
    }
    _genCode(slots) {
        this.genAvailable(slots);
        if (this.param !== null) {
            var c = `#define ${this.name}(k) ${this.param.token}`;
            if (this.param.size > 1) {
                c += `.${this.comps}`;
            }
            _addPreCode(slots, this.shader, c);
        }
    }
    genAvailable(slots) {
        const val = (this.param === null) ? '0' : '1';
        const def = `#define HAS_${this.name} ${val}\n`;
        slots.add('definitions', def);
    }
}
Input.Sampler = Sampler;
Input.Uniform = Uniform;
Input.Attribute = Attribute;
Input.Constant = Constant;
Input.FRAGMENT = 1;
Input.VERTEX = 2;
Input.ALL = 3;
