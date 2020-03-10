import Enum from './Enum';
import { mat4 } from 'gl-matrix';
import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import DepthFormat from './DepthFormatEnum';
import ShaderPrecision from './ShaderPrecision';
import MaterialPass from './MaterialPass';
const M4 = mat4.create();
export default class DepthPass extends MaterialPass {
    constructor(gl) {
        super({
            uid: 'stddepth',
            vert: VertShader(),
            frag: FragShader(),
        });
        this.depthFormat = this.inputs.add(new Enum('depthFormat', DepthFormat));
        this.precision = this.inputs.add(new ShaderPrecision('highp'));
    }
    setLightSetup(setup) {
        var _a;
        this.depthFormat.proxy((_a = setup) === null || _a === void 0 ? void 0 : _a.depthFormat);
    }
    prepare(prg, node, camera) {
        camera.modelViewProjectionMatrix(M4, node._wmatrix);
        prg.uMVP(M4);
    }
}
