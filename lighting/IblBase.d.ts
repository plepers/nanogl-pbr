import Program from 'nanogl/program';
import { ShMode } from '../interfaces/ShMode';
import Light from './Light';
export default abstract class IblBase extends Light {
    sh: ArrayLike<number>;
    shMode: ShMode;
    enableRotation: boolean;
    constructor(sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo?: number): Float32Array;
}
