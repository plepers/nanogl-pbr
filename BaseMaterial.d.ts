import GLConfig from 'nanogl-state/config';
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import { ShaderSource } from './interfaces/IProgramSource';
import MaterialPass from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
declare class PassInstance {
    readonly id: string;
    readonly pass: MaterialPass;
    readonly material: BaseMaterial;
    _program: Program | null;
    _revision: number;
    constructor(material: BaseMaterial, id: string, pass: MaterialPass);
    getSourceRevision(): number;
    prepare(node: Node, camera: Camera): void;
    getProgram(): Program;
    private compile;
}
export default abstract class BaseMaterial {
    name: string;
    mask: number;
    glconfig: GLConfig;
    inputs: ChunkCollection;
    _prgcache: ProgramCache;
    _passMap: Map<string, PassInstance>;
    _passes: PassInstance[];
    _defaultPass: PassInstance;
    constructor(gl: GLContext, defaultPass: MaterialPass, name?: string);
    abstract getShaderSource(): ShaderSource;
    addPass(id: string, pass: MaterialPass): PassInstance;
    removePass(id: string): void;
    getPass(id: string): PassInstance | undefined;
    hasPass(id: string): boolean;
    getAllPasses(): PassInstance[];
    getProgram(): Program;
}
export {};
