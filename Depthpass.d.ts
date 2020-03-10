import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import LightSetup from './LightSetup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import { DepthFormatEnum } from './DepthFormatEnum';
import ShaderPrecision from './ShaderPrecision';
import MaterialPass from './MaterialPass';
export default class DepthPass extends MaterialPass {
    depthFormat: DepthFormatEnum;
    precision: ShaderPrecision;
    constructor(gl: GLContext);
    setLightSetup(setup: LightSetup): void;
    prepare(prg: Program, node: Node, camera: Camera<ICameraLens>): void;
}
