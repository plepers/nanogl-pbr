import TexCoord from "./TexCoord";
import ChunkCollection from "./ChunkCollection";
export default class TexCoordCollection {
    readonly _inputs: ChunkCollection;
    readonly _texCoords: Map<string, TexCoord>;
    readonly _list: TexCoord[];
    constructor(inputs: ChunkCollection);
    getTexCoord(attrib: string): TexCoord;
}
