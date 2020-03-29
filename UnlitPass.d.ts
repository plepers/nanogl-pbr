import Program from 'nanogl/program';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import MaterialPass from './MaterialPass';
import Flag from './Flag';
import Input from './Input';
import { AlphaModeEnum } from './AlphaModeEnum';
import ShaderVersion from './ShaderVersion';
import ShaderPrecision from './ShaderPrecision';
import LightSetup from './LightSetup';
export default class UnlitPass extends MaterialPass {
    version: ShaderVersion;
    precision: ShaderPrecision;
    shaderid: Flag;
    baseColor: Input;
    baseColorFactor: Input;
    alpha: Input;
    alphaFactor: Input;
    alphaCutoff: Input;
    alphaMode: AlphaModeEnum;
    doubleSided: Flag;
    constructor(name?: string);
    setLightSetup(setup: LightSetup): void;
    prepare(prg: Program, node: Node, camera: Camera): void;
}
