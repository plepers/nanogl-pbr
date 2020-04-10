import GLConfig from 'nanogl-state/config';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramSource from './ProgramSource';
export declare class PassInstance {
    readonly pass: MaterialPass;
    readonly material: BaseMaterial;
    readonly programSource: ProgramSource;
    _program: Program | null;
    constructor(material: BaseMaterial, pass: MaterialPass);
    prepare(node: Node, camera: Camera): Program;
    getProgram(): Program;
}
export default class BaseMaterial {
    name: string;
    mask: number;
    glconfig: GLConfig;
    inputs: ChunkCollection;
    _passMap: Map<MaterialPassId, PassInstance>;
    _passes: PassInstance[];
    gl: GLContext;
    constructor(gl: GLContext, name?: string);
    addPass(pass: MaterialPass, id?: MaterialPassId): PassInstance;
    removePass(id: MaterialPassId): void;
    getPass(id: MaterialPassId): PassInstance | undefined;
    hasPass(id: MaterialPassId): boolean;
    getAllPasses(): PassInstance[];
    getProgram(passId: MaterialPassId): Program | undefined;
}
