import LightType from "./LightType";
import { ShadowMappedLightModel } from './AbstractLightModel';
export default class DirectionalLightModel extends ShadowMappedLightModel {
    constructor(code, preCode) {
        super(code, preCode);
        this.type = LightType.DIRECTIONAL;
        this._directions = null;
        this._colors = null;
    }
    genCodePerLights(light, index, shadowIndex) {
        var o = {
            index: index,
            shadowIndex: shadowIndex
        };
        return this.codeTemplate(o);
    }
    allocate(n) {
        if (this._colors === null || this._colors.length / 4 !== n) {
            this._directions = new Float32Array(n * 3);
            this._colors = new Float32Array(n * 4);
        }
    }
    update(model) {
        var lights = this.lights;
        this.allocate(lights.length);
        for (var i = 0; i < lights.length; i++) {
            var l = lights[i];
            this._directions.set(l._wdir, i * 3);
            this._colors.set(l._color, i * 4);
            this._colors[i * 4 + 3] = l.iblShadowing;
            if (l._castShadows) {
                var shIndex = model.shadowChunk.addLight(l);
                if (this.shadowIndices[i] !== shIndex) {
                    this.invalidateCode();
                }
                this.shadowIndices[i] = shIndex;
            }
            else {
                this.shadowIndices[i] = -1;
            }
        }
        this._invalid = true;
    }
    setup(prg) {
        if (this.lights.length > 0) {
            super.setup(prg);
            prg.uLDirDirections(this._directions);
            prg.uLDirColors(this._colors);
            this._invalid = false;
        }
    }
}
