import ChunksTree from "../chunks-tree";
export default interface IMaterial {
    inputs: ChunksTree;
    _vertSrc: string;
    _fragSrc: string;
}
