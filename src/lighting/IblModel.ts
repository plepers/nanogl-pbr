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
import { mat3, vec3 } from "gl-matrix";
import Enum from "../Enum";
import IblBase from "./IblBase";


const M3 = mat3.create()
const V3 = vec3.create()


export const IblTypes = [
  "OCTA",
  "PMREM",
] as const

export type IblType = typeof IblTypes[number]

export class IblModel extends AbstractLightModel<IblBase> {

  readonly type = LightType.IBL;

  enableRotation     : Flag = new Flag("enableRotation"     )
  enableBoxProjection: Flag = new Flag("enableBoxProjection")

  _iblType = new Enum("iblType", IblTypes)


  genCodePerLights(light: Ibl, index: number, shadowIndex: number): string {
    this.enableRotation.set( light.enableRotation )
    return this.codeTemplate(this)
  }

  prepare( gl : GLContext, model: ILightModel ): void {
    const ibl = this.lights[0]
    if( ibl ){
      this.enableRotation.set(ibl.enableRotation)
      this.enableBoxProjection.set(ibl.enableBoxProjection)
    } 
  }


  addLight(l: IblBase) {
    if (this.lights.length > 0){
      throw new Error("IblModel support only one Ibl Light")
    }
    this.addChild(this.getSHChunk(l));
    this._iblType.set(l.iblType)
    super.addLight( l );

  }

  getSHChunk( l: IblBase ){
    return l.shMode === "SH7" ? new SH7() : new SH9();
  }

  constructor( code : GlslCode, preCode : GlslCode ) {
    super( code, preCode );
    this.addChild( this.enableRotation )
    this.addChild( this.enableBoxProjection )
    this.addChild( this._iblType )
  }


  setup( prg : Program ){
    if( this.lights.length > 0 ){
      const ibl = this.lights[0]
      prg.tEnv(       ibl.env );
      prg.uSHCoeffs(  ibl.sh  );
      if( ibl.enableRotation ){
        mat3.fromMat4( M3, ibl._wmatrix)
        mat3.invert( M3, M3 )
        prg.uEnvMatrix( M3 );
      }
      if( ibl.enableBoxProjection ){

        vec3.scaleAndAdd(V3, ibl._wposition as vec3, ibl.boxProjectionSize, -0.5)
        prg.uBoxProjMin( V3 );
        
        vec3.scaleAndAdd(V3, ibl._wposition as vec3, ibl.boxProjectionSize, 0.5)
        prg.uBoxProjMax( V3 );
        
        vec3.add(V3, ibl._wposition as vec3, ibl.boxProjectionOffset)
        prg.uBoxProjPos( V3 );
      }
    }
  }


}
