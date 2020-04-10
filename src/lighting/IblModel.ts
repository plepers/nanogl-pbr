import Chunk from "../Chunk";
import { GlslCode } from "../interfaces/GlslCode";
import IBL from "./Ibl";
import Program from "nanogl/program";
import ChunksSlots from "../ChunksSlots";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";



export class IblModel extends AbstractLightModel<IBL> {

  readonly type = LightType.IBL;


  genCodePerLights(light: IBL, index: number, shadowIndex: number): string {
    return this.codeTemplate(this)
  }

  update(model: ILightModel ): void {
    
  }


  addLight(l: IBL) {
    if (this.lights.length > 0){
      throw new Error("IblModel support only one Ibl Light")
    }
    super.addLight( l );
  }


  constructor( code : GlslCode, preCode : GlslCode ) {
    super( code, preCode );
  }


  setup( prg : Program ){
    if( this.lights.length>0 ){
      const ibl = this.lights[0]
      if( prg.tEnv )      prg.tEnv(       ibl.env );
      if( prg.uSHCoeffs ) prg.uSHCoeffs(  ibl.sh  );
    }
  }


}
