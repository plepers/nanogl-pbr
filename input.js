import Chunk from './chunk';
const NONE_MODE = 0, CONSTANT_MODE = 1, UNIFORM_MODE = 2, SAMPLER_MODE = 3, ATTRIB_MODE = 4;
var DECL_TYPES = [
    '', '',
    'uniform',
    'uniform',
    'attribute'
];
var TYPES = [
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
class Sampler extends Chunk {
    constructor(name, texCoords) {
        super(true, true);
        this._input = null;
        this.name = name;
        this.texCoords = texCoords;
        this._tex = null;
        this.size = 4;
        if (isAttribute(texCoords)) {
            this._linkAttrib = true;
            this.add(texCoords);
            this.uvsToken = texCoords.token;
        }
        else {
            this._linkAttrib = false;
            this.uvsToken = texCoords;
        }
        this.token = 'VAL_' + this.name + this.uvsToken;
    }
    set(t) {
        this._tex = t;
    }
    genCode(slots) {
        if (this._input == null)
            return;
        var name = this.name, c;
        c = 'uniform sampler2D ' + name + ';\n';
        _addPreCode(slots, this._input.shader, c);
        c = 'vec4 ' + this.token + ' = texture2D( ' + name + ', ' + this.uvsToken + ');\n';
        _addCode(slots, this._input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._tex);
    }
    getHash() {
        return (this._linkAttrib ? '' : this.texCoords) + '-' +
            this.name;
    }
}
class Uniform extends Chunk {
    constructor(name, size) {
        super(true, true);
        this._input = null;
        this.name = name;
        this.size = size;
        this._value = new Float32Array(size);
        this.token = this.name;
    }
    set() {
        for (var i = 0; i < arguments.length; i++) {
            this._value[i] = arguments[i];
        }
        this._invalid = true;
    }
    genCode(slots) {
        if (this._input === null)
            return;
        var c;
        c = 'uniform ' + TYPES[this.size] + ' ' + this.token + ';\n';
        _addPreCode(slots, this._input.shader, c);
    }
    setup(prg) {
        prg[this.name](this._value);
        this._invalid = false;
    }
    getHash() {
        return this.size + '-' +
            this.name;
    }
}
class Attribute extends Chunk {
    constructor(name, size) {
        super(true, false);
        this._input = null;
        this.name = name;
        this.size = size;
        this.token = 'v_' + this.name;
    }
    genCode(slots) {
        var c;
        c = 'varying ' + TYPES[this.size] + ' ' + this.token + ';\n';
        slots.add('pf', c);
        c = 'attribute ' + TYPES[this.size] + ' ' + this.name + ';\n';
        c += 'varying   ' + TYPES[this.size] + ' ' + this.token + ';\n';
        slots.add('pv', c);
        c = this.token + ' = ' + this.name + ';\n';
        slots.add('v', c);
    }
    getHash() {
        return this.size + '-' +
            this.name;
    }
}
class Constant extends Chunk {
    constructor(value) {
        super(true, false);
        this._input = null;
        this.name = 'CONST_' + (0 | (Math.random() * 0x7FFFFFFF)).toString(16);
        if (Array.isArray(value)) {
            this.size = value.length;
        }
        else {
            this.size = 1;
        }
        this.value = value;
        this.token = 'VAR_' + this.name;
    }
    genCode(slots) {
        if (this._input === null)
            return;
        var c;
        c = '#define ' + this.token + ' ' + TYPES[this.size] + '(' + this._stringifyValue() + ')\n';
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
    getHash() {
        return this._stringifyValue() + '-' +
            this.size + '-';
    }
}
class Input extends Chunk {
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
            this.remove(this.param);
        }
        param._input = this;
        this.param = param;
        this.add(param);
        this.comps = _trimComps(comps, this.size);
    }
    detach() {
        if (this.param !== null) {
            this.param._input = null;
            this.remove(this.param);
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
    getHash() {
        var hash = this.size + '-' +
            this.comps + '-' +
            this.name;
        return hash;
    }
    genCode(slots) {
        this.genAvailable(slots);
        if (this.param !== null) {
            var c = `#define ${this.name}(k) ${this.param.token}`;
            if (this.param.size > 1) {
                c += '.' + this.comps;
            }
            _addPreCode(slots, this.shader, c);
        }
    }
    genAvailable(slots) {
        var val = (this.param === null) ? '0' : '1';
        var def = '#define HAS_' + this.name + ' ' + val + '\n';
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
export default Input;
