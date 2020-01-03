import Program from 'nanogl/program';
import { GLContext } from 'nanogl/types';
import IProgramSource from './interfaces/IProgramSource';
declare class ProgramCache {
    gl: GLContext;
    private _cache;
    constructor(gl: GLContext);
    static getCache(gl: GLContext): ProgramCache;
    compile(source: IProgramSource): Program;
    release(prg: Program): void;
}
export default ProgramCache;
