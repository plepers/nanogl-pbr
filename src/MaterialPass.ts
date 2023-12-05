import GLConfig from "nanogl-state/GLConfig";
import ChunkCollection from "./ChunkCollection";
import { ShaderSource } from "./interfaces/IProgramSource";
import Program from "nanogl/program";
import Node from "nanogl-node";
import Camera from "nanogl-camera";

/** An id for a material pass. */
export type MaterialPassId = 'color' | 'depth' | string

/**
 * This class is the base class for all material passes.
 */
export default abstract class MaterialPass {
    /** The name of the pass */
    name: string = '';
    /** The render mask of the pass */
    mask: number = ~0;

    /** The GLConfig of the pass */
    readonly glconfig : GLConfig = new GLConfig();
    /** The collection of shader chunks */
    inputs: ChunkCollection = new ChunkCollection();

    /**
     * @param {ShaderSource} _shaderSource The shader source for this pass
     */
    constructor( public _shaderSource : ShaderSource ){}

    /**
     * Prepare the given program for this pass.
     * @param {Program} prg The program to setup
     * @param {Node} node The node to use for transforms
     * @param {Camera} camera The camera to use for projection
     */
    abstract prepare( prg: Program, node: Node, camera: Camera ) : void;

  }
