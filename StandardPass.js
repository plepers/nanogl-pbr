import Input from './Input';
import Flag from './Flag';
import Enum from './Enum';
import Precision from './ShaderPrecision';
import Version from './ShaderVersion';
import { mat4 } from 'gl-matrix';
import getVert from './glsl/pbr.vert';
import getFrag from './glsl/pbr.frag';
import { isWebgl2 } from 'nanogl/types';
import { GammaModes } from './GammaModeEnum';
import MaterialPass from './MaterialPass';
const M4 = mat4.create();
const MAT_ID = 'std';
export default class StandardPass extends MaterialPass {
    constructor(gl, name) {
        super({
            uid: MAT_ID,
            vert: getVert(),
            frag: getFrag(),
        });
        this.ibl = null;
        const webgl2 = isWebgl2(gl);
        this.version = this.inputs.add(new Version(webgl2 ? '300 es' : '100'));
        this.precision = this.inputs.add(new Precision('mediump'));
        this.iAlbedo = this.inputs.add(new Input('albedo', 3));
        this.iSpecular = this.inputs.add(new Input('specular', 3));
        this.iGloss = this.inputs.add(new Input('gloss', 1));
        this.iNormal = this.inputs.add(new Input('normal', 3));
        this.iOcclusion = this.inputs.add(new Input('occlusion', 1));
        this.iCavity = this.inputs.add(new Input('cavity', 1));
        this.iCavityStrength = this.inputs.add(new Input('cavityStrength', 2));
        this.iEmissive = this.inputs.add(new Input('emissive', 1));
        this.iEmissiveScale = this.inputs.add(new Input('emissiveScale', 1));
        this.iFresnel = this.inputs.add(new Input('fresnel', 3));
        this.iGamma = this.inputs.add(new Input('gamma', 1));
        this.iExposure = this.inputs.add(new Input('exposure', 1));
        this.conserveEnergy = this.inputs.add(new Flag('conserveEnergy', true));
        this.perVertexIrrad = this.inputs.add(new Flag('perVertexIrrad', false));
        this.glossNearest = this.inputs.add(new Flag('glossNearest', false));
        this.useDerivatives = this.inputs.add(new Flag('useDerivatives', false));
        this.gammaMode = this.inputs.add(new Enum('gammaMode', GammaModes));
    }
    setIBL(ibl) {
        this.ibl = ibl;
    }
    setLightSetup(setup) {
        this.inputs.addChunks(setup.getChunks('std'));
    }
    prepare(prg, node, camera) {
        this.ibl.setupProgram(prg);
        camera.modelViewProjectionMatrix(M4, node._wmatrix);
        prg.uMVP(M4);
        prg.uWorldMatrix(node._wmatrix);
        prg.uCameraPosition(camera._wposition);
    }
}
;
