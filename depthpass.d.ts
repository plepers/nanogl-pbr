import Config from 'nanogl-state/config';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramCache from './program-cache';
import { GLContext } from 'nanogl/types';
import ChunksList from './chunks-tree';
import { GlslPrecision } from './interfaces/precision';
import IMaterial from './interfaces/material';
import Program from 'nanogl/program';
import LightSetup from './light-setup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import { DepthFormatEnum } from './depth-format-enum';
declare class DepthPass implements IMaterial {
    _vertSrc: string;
    _fragSrc: string;
    inputs: ChunksList;
    depthFormat: DepthFormatEnum;
    config: Config;
    _prgcache: ProgramCache;
    _uid: string;
    _precision: GlslPrecision;
    prg: Program | null;
    constructor(gl: GLContext);
    setLightSetup(setup: LightSetup): void;
    prepare(node: Node, camera: Camera<ICameraLens>): void;
    _isDirty(): boolean;
    compile(): void;
}
export default DepthPass;
