import GLConfig from "nanogl-state/GLConfig";
import ChunkCollection from "./ChunkCollection";
import { ShaderSource } from "./interfaces/IProgramSource";
import Program from "nanogl/program";
import Node from "nanogl-node";
import Camera from "nanogl-camera";


export type MaterialPassId = 'color' | 'depth' | string

export default abstract class MaterialPass {

    name: string = '';
    mask: number = ~0;
    
    readonly glconfig : GLConfig = new GLConfig();
    inputs: ChunkCollection = new ChunkCollection();
    
    constructor( public _shaderSource : ShaderSource ){}

    abstract prepare( prg: Program, node: Node, camera: Camera ) : void;

  }
  