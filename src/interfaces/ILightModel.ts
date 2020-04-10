import Light from "../lighting/Light";
import Chunk from "../Chunk";
import LightSetup from "../lighting/LightSetup";
import IBL from "../lighting/Ibl";


export default interface ILightModel{

  setLightSetup( ls : LightSetup ) : void;
  getLightSetup():LightSetup;

  add   ( l : Light ) : void;
  remove( l : Light ) : void;

  update() : void;
  getChunks() : Chunk[];

}

export interface ILightModelCode{

  dirPreCode     : (o:any)=>string;
  spotPreCode    : (o:any)=>string;
  pointPreCode   : (o:any)=>string;

  dirLightCode   : (o:any)=>string;
  spotLightCode  : (o:any)=>string;
  pointLightCode : (o:any)=>string;

  shadPreCode    : (o:any)=>string;
  preLightCode   : (o:any)=>string;
  postLightCode  : (o:any)=>string;

  iblPreCode : (o:any)=>string;
  iblCode    : (o:any)=>string;

}