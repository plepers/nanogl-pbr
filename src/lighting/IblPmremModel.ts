import { GlslCode } from "../interfaces/GlslCode";
import IblPmrem from "./IBLPmrem";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import SH9 from "./SH9";
import SH7 from "./SH7";


export class IBLPmremModel extends AbstractLightModel<IblPmrem> {

  readonly type = LightType.IBL_PMREM;

  genCodePerLights(light: IblPmrem, index: number, shadowIndex: number): string {
    return this.codeTemplate(this)
  }

  prepare( gl : GLContext, model: ILightModel ): void {
    
  }


  addLight(l: IblPmrem) {
    if (this.lights.length > 0){
      throw new Error("IblModel support only one Ibl Light")
    }

    super.addLight( l );
    this.addChild( this.getSHChunk(l) );

  }

  getSHChunk( l: IblPmrem ){
    return l.shMode === "SH7" ? new SH7() : new SH9();
  }

  constructor( code : GlslCode, preCode : GlslCode ) {
    super( code, preCode );
  }


  setup( prg : Program ){
    if( this.lights.length>0 ){
      const ibl = this.lights[0]
      if( prg.tEnv      ) prg.tEnv     ( ibl.env  );
      if( prg.uSHCoeffs ) prg.uSHCoeffs( ibl.sh   );
    }
  }


}
