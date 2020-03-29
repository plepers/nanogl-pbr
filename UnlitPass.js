import { mat4 } from 'gl-matrix';
import vShader from './glsl/unlit.vert';
import fShader from './glsl/unlit.frag';
import MaterialPass from './MaterialPass';
import Flag from './Flag';
import Input from './Input';
import { AlphaModes } from './AlphaModeEnum';
import Enum from './Enum';
import ShaderVersion from './ShaderVersion';
import ShaderPrecision from './ShaderPrecision';
const M4 = mat4.create();
const MAT_ID = 'unlit';
export default class UnlitPass extends MaterialPass {
    constructor(name = 'unlit-pass') {
        super({
            uid: MAT_ID,
            vert: vShader(),
            frag: fShader(),
        });
        const inputs = this.inputs;
        inputs.add(this.version = new ShaderVersion('100'));
        inputs.add(this.precision = new ShaderPrecision('highp'));
        inputs.add(this.shaderid = new Flag('id_' + MAT_ID, true));
        inputs.add(this.baseColor = new Input('baseColor', 3));
        inputs.add(this.baseColorFactor = new Input('baseColorFactor', 3));
        inputs.add(this.alpha = new Input('alpha', 1));
        inputs.add(this.alphaFactor = new Input('alphaFactor', 1));
        inputs.add(this.alphaCutoff = new Input('alphaCutoff', 1));
        inputs.add(this.alphaMode = new Enum('alphaMode', AlphaModes));
        inputs.add(this.doubleSided = new Flag('doubleSided', false));
    }
    setLightSetup(setup) { }
    prepare(prg, node, camera) {
        if (prg.uMVP) {
            camera.modelViewProjectionMatrix(M4, node._wmatrix);
            prg.uMVP(M4);
        }
        if (prg.uWorldMatrix)
            prg.uWorldMatrix(node._wmatrix);
        if (prg.uVP)
            prg.uVP(camera._viewProj);
    }
}
;
