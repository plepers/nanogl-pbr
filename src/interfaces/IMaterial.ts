import ChunksTree from "../ChunkCollection";
import Program from "nanogl/program";

/** @hidden */
export default interface IMaterial {
    prg: Program | null
    inputs : ChunksTree;
    name?:string;

    _vertSrc : string;
    _fragSrc : string;

    compile():void;

}
