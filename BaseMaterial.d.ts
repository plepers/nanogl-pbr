import GLConfig from 'nanogl-state/config';
import ProgramCache from './ProgramCache';
import { GLContext } from 'nanogl/types';
import Program from 'nanogl/program';
import ChunkCollection from './ChunkCollection';
import MaterialPass, { MaterialPassId } from './MaterialPass';
import Node from 'nanogl-node';
import Camera from 'nanogl-camera';
export declare class PassInstance {
    readonly id: string;
    readonly pass: MaterialPass;
    readonly material: BaseMaterial;
    _program: Program | null;
    _revision: number;
    constructor(material: BaseMaterial, id: string, pass: MaterialPass);
    getSourceRevision(): number;
    prepare(node: Node, camera: Camera): Program;
    getProgram(): Program;
    private compile;
}
export default class BaseMaterial {
    name: string;
    mask: number;
    glconfig: GLConfig;
    inputs: ChunkCollection;
    _prgcache: ProgramCache;
    _passMap: Map<MaterialPassId, PassInstance>;
    _passes: PassInstance[];
    constructor(gl: GLContext, name?: string);
    addPass(pass: MaterialPass, id?: MaterialPassId): PassInstance;
    removePass(id: MaterialPassId): void;
    getPass(id: MaterialPassId): PassInstance | undefined;
    hasPass(id: MaterialPassId): boolean;
    getAllPasses(): PassInstance[];
    getProgram(passId: MaterialPassId): Program | undefined;
}
