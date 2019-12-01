import NGLProgram from 'nanogl/program';
import { GLContext } from 'nanogl/types';
import IMaterial from './interfaces/material';
declare class Program extends NGLProgram {
    _usage: number;
    _currentMaterial: IMaterial | null;
    constructor(gl: GLContext, vert?: string, frag?: string, defs?: string);
    setupInputs(material: IMaterial): void;
}
export default Program;
