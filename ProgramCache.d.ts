import Program from 'nanogl/program';
import { GLContext } from 'nanogl/types';
import ChunkSlots from './ChunksSlots';
import IMaterial from './interfaces/IMaterial';
declare class ProgramCache {
    gl: GLContext;
    private _cache;
    constructor(gl: GLContext);
    static getCache(gl: GLContext): ProgramCache;
    compile(material: IMaterial): Program;
    release(prg: Program): void;
    processSlots(source: string, slots: ChunkSlots): string;
}
export default ProgramCache;
