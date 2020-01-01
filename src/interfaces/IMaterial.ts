import ChunksTree from "../ChunksCollection";
import Program from "nanogl/program";


export default interface IMaterial {
    prg: Program | null
    inputs : ChunksTree;
    name?:string;
    
    _vertSrc : string;
    _fragSrc : string;



    compile():void;

}
