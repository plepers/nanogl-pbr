import Program from 'nanogl/program';
import { GLContext } from 'nanogl/types';
import ChunkSlots from './chunks-slots';
import IMaterial from './interfaces/material';
declare class ProgramCache {
    gl: GLContext;
    private _cache;
    constructor(gl: GLContext);
    static getCache(gl: GLContext): ProgramCache;
    compile(material: IMaterial): Program;
    release(prg: Program): void;
    _addProgram(prg: Program, hash: string): void;
    processSlots(code: string, slots: ChunkSlots): string;
}
export default ProgramCache;
