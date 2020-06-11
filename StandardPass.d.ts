import Input from './Input';
import Flag from './Flag';
import { GammaModeEnum } from './GammaModeEnum';
import MaterialPass from './MaterialPass';
import Program from 'nanogl/program';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import LightSetup from './lighting/LightSetup';
import { AlphaModeEnum } from './AlphaModeEnum';
import ShaderVersion from './ShaderVersion';
import ShaderPrecision from './ShaderPrecision';
import { PbrSurface, SpecularSurface, MetalnessSurface } from './PbrSurface';
import { ColorSpaceEnum } from './ColorspaceEnum';
export declare class StandardPass<TSurface extends PbrSurface = PbrSurface> extends MaterialPass {
    version: ShaderVersion;
    precision: ShaderPrecision;
    shaderid: Flag;
    alpha: Input;
    alphaFactor: Input;
    alphaCutoff: Input;
    emissive: Input;
    emissiveFactor: Input;
    normal: Input;
    normalScale: Input;
    occlusion: Input;
    occlusionStrength: Input;
    iGamma: Input;
    iExposure: Input;
    alphaMode: AlphaModeEnum;
    gammaMode: GammaModeEnum;
    emissiveColorSpace: ColorSpaceEnum;
    doubleSided: Flag;
    perVertexIrrad: Flag;
    horizonFading: Flag;
    glossNearest: Flag;
    surface?: TSurface;
    constructor(name?: string);
    setSurface(surface: TSurface): void;
    setLightSetup(setup: LightSetup): void;
    prepare(prg: Program, node: Node, camera: Camera): void;
}
export declare class StandardSpecular extends StandardPass<SpecularSurface> {
    readonly surface: SpecularSurface;
    constructor(name?: string);
}
export declare class StandardMetalness extends StandardPass<MetalnessSurface> {
    readonly surface: MetalnessSurface;
    constructor(name?: string);
}
