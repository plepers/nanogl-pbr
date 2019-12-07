import Light from "../light";
import Chunk from "../chunk";
import LightSetup from "../light-setup";


export default interface ILightModel{

  setLightSetup( ls : LightSetup ) : void;
  getLightSetup():LightSetup;

  add   ( l : Light ) : void;
  remove( l : Light ) : void;
  
  update() : void;
  getChunks() : Chunk[];

}