import GLConfig from 'nanogl-state/GLConfig';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
import ProgramSource from './ProgramSource';
export declare class PassInstance {
    readonly pass: MaterialPass;
    readonly material: Material;
    readonly programSource: ProgramSource;
    _program: Program | null;
    constructor(material: Material, pass: MaterialPass);
    prepare(node: Node, camera: Camera): Program;
    getProgram(): Program;
}
export default class Material {
    readonly gl: GLContext;
    name: string;
    mask: number;
    readonly glconfig: GLConfig;
    readonly inputs: ChunkCollection;
    _passMap: Map<string, PassInstance>;
    _passes: PassInstance[];
    constructor(gl: GLContext, name?: string);
    addPass(pass: MaterialPass, id?: MaterialPassId): PassInstance;
    removePass(id: MaterialPassId): void;
    getPass(id?: MaterialPassId): PassInstance | undefined;
    hasPass(id: MaterialPassId): boolean;
    getAllPasses(): PassInstance[];
    getProgram(passId: MaterialPassId): Program | undefined;
}
