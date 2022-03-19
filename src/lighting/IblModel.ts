import { GlslCode } from "../interfaces/GlslCode";
import Ibl from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import SH9 from "./SH9";
import SH7 from "./SH7";
import Flag from "../Flag";
import { mat3 } from "gl-matrix";


const M3 = mat3.create()

export class IblModel extends AbstractLightModel<Ibl> {

  readonly type = LightType.IBL;

  enableRotation: Flag = new Flag("enableRotation")


  genCodePerLights(light: Ibl, index: number, shadowIndex: number): string {
    this.enableRotation.set( light.enableRotation )
    return this.codeTemplate(this)
  }

  prepare( gl : GLContext, model: ILightModel ): void {
    const ibl = this.lights[0]
    if( ibl ){
      this.enableRotation.set(ibl.enableRotation)
    } 
  }


  addLight(l: Ibl) {
    if (this.lights.length > 0){
      throw new Error("IblModel support only one Ibl Light")
    }
    super.addLight( l );
    this.addChild(this.getSHChunk(l));

  }

  getSHChunk( l: Ibl ){
    return l.shMode === "SH7" ? new SH7() : new SH9();
  }

  constructor( code : GlslCode, preCode : GlslCode ) {
    super( code, preCode );
    this.addChild( this.enableRotation )
  }


  setup( prg : Program ){
    if( this.lights.length > 0 ){
      const ibl = this.lights[0]
      prg.tEnv(       ibl.env );
      prg.uSHCoeffs(  ibl.sh  );
      if( ibl.enableRotation ){
        prg.uEnvMatrix(  mat3.fromMat4( M3, ibl._wmatrix) );
      }
    }
  }


}
