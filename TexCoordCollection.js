import TexCoord from "./TexCoord";
export default class TexCoordCollection {
    constructor(inputs) {
        this._texCoords = new Map();
        this._list = [];
        this._inputs = inputs;
    }
    getTexCoord(attrib) {
        let tc = this._texCoords.get(attrib);
        if (tc === undefined) {
            tc = new TexCoord(attrib);
            this._inputs.add(tc);
            this._texCoords.set(attrib, tc);
            this._list.push(tc);
        }
        return tc;
    }
}
