import Program from 'nanogl/program';
import Texture from 'nanogl/texture';
export default class IBL {
    env: Texture;
    sh: ArrayLike<number>;
    constructor(env: Texture, sh: ArrayLike<number>);
    setupProgram(prg: Program): void;
    static convert(sh: ArrayLike<number>, expo: number): Float32Array;
}
