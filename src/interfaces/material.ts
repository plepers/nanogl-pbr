import ChunksTree from "../chunks-tree";


interface IMaterial {
    inputs : ChunksTree;
    _vertSrc : string;
    _fragSrc : string;
}


export default IMaterial;