import GLConfig from "nanogl-state/GLConfig";
import ChunkCollection from "./ChunkCollection";
import { ShaderSource } from "./interfaces/IProgramSource";
import Program from "nanogl/program";
import Node from "nanogl-node";
import Camera from "nanogl-camera";
export declare type MaterialPassId = 'color' | 'depth' | string;
export default abstract class MaterialPass {
    name: string;
    mask: number;
    readonly glconfig: GLConfig;
    inputs: ChunkCollection;
    _shaderSource: ShaderSource;
    constructor(shaderSource: ShaderSource);
    abstract prepare(prg: Program, node: Node, camera: Camera): void;
}
