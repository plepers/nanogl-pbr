import GLConfig from "nanogl-state/config";
import ChunkCollection from "./ChunkCollection";
import { ShaderSource } from "./interfaces/IProgramSource";
import Program from "nanogl/program";
import Node from "nanogl-node";
import Camera from "nanogl-camera";
export default class MaterialPass {
    name: string;
    mask: number;
    readonly glconfig: GLConfig;
    inputs: ChunkCollection;
    _shaderSource: ShaderSource;
    constructor(shaderSource: ShaderSource);
    prepare(prg: Program, node: Node, camera: Camera): void;
}
