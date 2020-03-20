import ChunkCollection from "./ChunkCollection";
import { ShaderSource } from "./interfaces/IProgramSource";
import { GLContext } from "nanogl/types";
import Program from "nanogl/program";
export default class ProgramSource {
    private _chunkCollections;
    private _shaderSource;
    private _prgCache;
    _program: Program | null;
    _revision: number;
    constructor(gl: GLContext, shaderSource: ShaderSource);
    addChunkCollection(chunkCollection: ChunkCollection): void;
    getSourceRevision(): number;
    setupProgram(): Program;
    getProgram(): Program;
    compile(): void;
}
