import { mat4 } from 'gl-matrix';
import vShader from './glsl/standard.vert';
import fShader from './glsl/standard.frag';
import Input from './Input';
import Flag from './Flag';
import Enum from './Enum';
import { GammaModes } from './GammaModeEnum';
import MaterialPass from './MaterialPass';
import { AlphaModes } from './AlphaModeEnum';
import ShaderVersion from './ShaderVersion';
import ShaderPrecision from './ShaderPrecision';
import { SpecularSurface, MetalnessSurface } from './PbrSurface';
const M4 = mat4.create();
const MAT_ID = 'std';
export class StandardPass extends MaterialPass {
    constructor(name = 'gltf-std-pass') {
        super({
            uid: MAT_ID,
            vert: vShader(),
            frag: fShader(),
        });
        const inputs = this.inputs;
        inputs.add(this.version = new ShaderVersion());
        inputs.add(this.precision = new ShaderPrecision('highp'));
        inputs.add(this.shaderid = new Flag('id_' + MAT_ID, true));
        inputs.add(this.alpha = new Input('alpha', 1));
        inputs.add(this.alphaFactor = new Input('alphaFactor', 1));
        inputs.add(this.alphaCutoff = new Input('alphaCutoff', 1));
        inputs.add(this.emissive = new Input('emissive', 3));
        inputs.add(this.emissiveFactor = new Input('emissiveFactor', 3));
        inputs.add(this.normal = new Input('normal', 3));
        inputs.add(this.normalScale = new Input('normalScale', 1));
        inputs.add(this.occlusion = new Input('occlusion', 1));
        inputs.add(this.occlusionStrength = new Input('occlusionStrength', 1));
        inputs.add(this.iGamma = new Input('gamma', 1));
        inputs.add(this.iExposure = new Input('exposure', 1));
        inputs.add(this.alphaMode = new Enum('alphaMode', AlphaModes));
        inputs.add(this.gammaMode = new Enum('gammaMode', GammaModes)).set('GAMMA_2_2');
        inputs.add(this.doubleSided = new Flag('doubleSided', false));
        inputs.add(this.perVertexIrrad = new Flag('perVertexIrrad', false));
        inputs.add(this.horizonFading = new Flag('horizonFading', false));
        inputs.add(this.glossNearest = new Flag('glossNearest', false));
    }
    setSurface(surface) {
        if (this.surface) {
            this.inputs.remove(this.surface);
        }
        this.surface = surface;
        this.inputs.add(this.surface);
    }
    setLightSetup(setup) {
        this.inputs.addChunks(setup.getChunks('std'));
    }
    prepare(prg, node, camera) {
        if (prg.uMVP) {
            camera.modelViewProjectionMatrix(M4, node._wmatrix);
            prg.uMVP(M4);
        }
        if (prg.uWorldMatrix)
            prg.uWorldMatrix(node._wmatrix);
        if (prg.uVP)
            prg.uVP(camera._viewProj);
        if (prg.uCameraPosition)
            prg.uCameraPosition(camera._wposition);
    }
}
;
export class StandardSpecular extends StandardPass {
    constructor(name = 'gltf-std-pass') {
        super(name);
        var surface = new SpecularSurface();
        this.setSurface(surface);
    }
}
export class StandardMetalness extends StandardPass {
    constructor(name = 'gltf-std-pass') {
        super(name);
        var surface = new MetalnessSurface();
        this.setSurface(surface);
    }
}
