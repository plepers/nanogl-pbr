import TexCoord from "./TexCoord";
import ChunkCollection from "./ChunkCollection";


export default class TexCoordCollection {
  
  readonly _inputs: ChunkCollection;
  readonly _texCoords : Map<string, TexCoord> = new Map()
  readonly _list : TexCoord[] = []

  constructor( inputs : ChunkCollection ){
    this._inputs = inputs; 
  }

  getTexCoord( attrib : string ) : TexCoord {
    let tc = this._texCoords.get( attrib );
    if( tc === undefined ){
      tc = new TexCoord( attrib );
      this._inputs.add( tc );
      this._texCoords.set( attrib, tc );
      this._list.push( tc );
    }
    return tc;
  }


}