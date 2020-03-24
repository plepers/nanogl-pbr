import Chunk from "./Chunk";
import Input from "./Input";
import Enum from "./Enum";
export var PbrWorkflowType;
(function (PbrWorkflowType) {
    PbrWorkflowType["NONE"] = "NONE";
    PbrWorkflowType["METALNESS"] = "METALNESS";
    PbrWorkflowType["SPECULAR"] = "SPECULAR";
})(PbrWorkflowType || (PbrWorkflowType = {}));
export default class PbrSurface extends Chunk {
    constructor(inputs) {
        super(false, false);
        this.setInputs(inputs);
        this._inputs = inputs;
    }
    static MetalnessSurface() {
        return new PbrSurface(new MetalnessInputs());
    }
    static SpecularSurface() {
        return new PbrSurface(new SpecularInputs());
    }
    _genCode(slots) { }
    get inputs() {
        return this._inputs;
    }
    setInputs(inputs) {
        if (inputs !== this._inputs) {
            if (this._inputs)
                this.removeChild(this._inputs);
            this._inputs = inputs;
            this.addChild(this._inputs);
        }
    }
}
export class PbrInputs extends Chunk {
    constructor() {
        super(true, false);
        this.type = PbrWorkflowType.NONE;
        this.pbrInputType = new Enum('pbrWorkflow', ['SPECULAR', 'METALNESS']);
        this.addChild(this.pbrInputType);
    }
    _genCode(slots) {
        slots.add('pbrsurface', 'PbrSurface surface = DefaultPbrSurface;');
    }
}
import metalnessGlsl from './glsl/includes/pbr-inputs-metalness.glsl';
export class MetalnessInputs extends PbrInputs {
    constructor() {
        super();
        this.type = PbrWorkflowType.METALNESS;
        this.pbrInputType.set(this.type);
        this.addChild(this.baseColor = new Input('baseColor', 3));
        this.addChild(this.baseColorFactor = new Input('baseColorFactor', 3));
        this.addChild(this.metalness = new Input('metalness', 1));
        this.addChild(this.metalnessFactor = new Input('metalnessFactor', 1));
        this.addChild(this.roughness = new Input('roughness', 1));
        this.addChild(this.roughnessFactor = new Input('roughnessFactor', 1));
    }
    _genCode(slots) {
        slots.add('pbrsurface', metalnessGlsl());
    }
}
import specularGlsl from './glsl/includes/pbr-inputs-specular.glsl';
export class SpecularInputs extends PbrInputs {
    constructor() {
        super();
        this.type = PbrWorkflowType.SPECULAR;
        this.pbrInputType.set(this.type);
        this.addChild(this.baseColor = new Input('diffuse', 3));
        this.addChild(this.baseColorFactor = new Input('diffuseFactor', 3));
        this.addChild(this.specular = new Input('specular', 3));
        this.addChild(this.specularFactor = new Input('specularFactor', 3));
        this.addChild(this.glossiness = new Input('glossiness', 1));
        this.addChild(this.glossinessFactor = new Input('glossinessFactor', 1));
    }
    _genCode(slots) {
        slots.add('pbrsurface', specularGlsl());
    }
}
