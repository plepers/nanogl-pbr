import { GlslCode } from "../interfaces/GlslCode";
import IBL from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";



export class IblModel extends AbstractLightModel<IBL> {

  readonly type = LightType.IBL;


  genCodePerLights(light: IBL, index: number, shadowIndex: number): string {
    return this.codeTemplate(this)
  }

  prepare( gl : GLContext, model: ILightModel ): void {
    
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
