import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
export default class PointLightModel extends AbstractLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.POINT;
        this._colors = null;
        this._positions = null;
    }
    genCodePerLights(light, index, shadowIndex) {
        var o = {
            index: index,
            shadowIndex: shadowIndex,
            infinite: light.radius <= 0,
        };
        return this.codeTemplate(o);
    }
    allocate(n) {
        if (this._colors === null || this._colors.length / 3 !== n) {
            this._colors = new Float32Array(n * 3);
            this._positions = new Float32Array(n * 4);
        }
    }
    prepare(gl, model) {
        const lights = this.lights;
        this.allocate(lights.length);
        for (var i = 0; i < lights.length; i++) {
            var l = lights[i];
            this._colors.set(l._color, i * 3);
            this._positions.set(l._wposition, i * 4);
            this._positions[i * 4 + 3] = l.radius;
            this.shadowIndices[i] = -1;
        }
        this._invalid = true;
    }
    setup(prg) {
        if (this.lights.length > 0) {
            super.setup(prg);
            prg.uLPointColors(this._colors);
            prg.uLPointPositions(this._positions);
            this._invalid = false;
        }
    }
}
