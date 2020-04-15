import Chunk from "../Chunk";
export default class AbstractLightModel extends Chunk {
    constructor(code, preCode) {
        super(true, true);
        this.lights = [];
        this.shadowIndices = [];
        this.preCodeTemplate = preCode;
        this.codeTemplate = code;
    }
    addLight(l) {
        if (this.lights.indexOf(l) === -1) {
            this.lights.push(l);
            this.shadowIndices.push(-1);
            this.invalidateCode();
        }
    }
    removeLight(l) {
        const i = this.lights.indexOf(l);
        if (i > -1) {
            this.lights.splice(i, 1);
            this.shadowIndices.splice(i, 1);
            this.invalidateCode();
        }
    }
    _genCode(slots) {
        let code = this.preCodeTemplate({
            count: this.lights.length
        });
        slots.add('pf', code);
        code = '';
        for (var i = 0; i < this.lights.length; i++) {
            code += this.genCodePerLights(this.lights[i], i, this.shadowIndices[i]);
        }
        slots.add('lightsf', code);
    }
}
export class ShadowMappedLightModel extends AbstractLightModel {
    setup(prg) {
        for (var i = 0; i < this.shadowIndices.length; i++) {
            var si = this.shadowIndices[i];
            if (si > -1) {
                var tex = this.lights[i].getShadowmap();
                prg['tShadowMap' + si](tex);
            }
        }
    }
}
