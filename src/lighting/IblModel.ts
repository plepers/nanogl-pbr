import { GlslCode } from "../interfaces/GlslCode";
import Ibl from "./Ibl";
import Program from "nanogl/program";
import AbstractLightModel from "./AbstractLightModel";
import LightType from "./LightType";
import ILightModel from "../interfaces/ILightModel";
import { GLContext } from "nanogl/types";
import Flag from "../Flag";
import { mat3, vec3 } from "gl-matrix";
import Enum from "../Enum";
import Input, { Constant } from "../Input";


const M3 = mat3.create()
const V3 = vec3.create()


export const IblFormats = [
  "OCTA",
  "PMREM",
] as const


export const ShFormats = [
  "SH9",
  "SH7",
] as const

export const HdrEncodings = [
  "RGBM",
  "RGBD",
  "RGBE",
] as const


export type IblFormat = typeof IblFormats[number]
export type ShFormat = typeof ShFormats[number]
export type HdrEncoding = typeof HdrEncodings[number]

export class IblModel extends AbstractLightModel<Ibl> {

  readonly type = LightType.IBL;

  private readonly enableRotation      = new Flag("enableRotation"     )
  private readonly enableBoxProjection = new Flag("enableBoxProjection")

  private readonly iblFormat   = new Enum("iblFormat"     , IblFormats  )
  private readonly shFormat    = new Enum("shFormat"      , ShFormats   )
  private readonly hdrEncoding = new Enum("iblHdrEncoding", HdrEncodings)
  private readonly intensities = new Input("iblIntensities", 2)
  private readonly mipLevels   = new Input("iblNumMipLevel", 1)

  private readonly intensitiesValue: Constant;
  private readonly mipLevelsValue: Constant;


  genCodePerLights(light: Ibl, index: number, shadowIndex: number): string {
    return this.codeTemplate(this)
  }

  prepare( gl : GLContext, model: ILightModel ): void {
    const ibl = this.lights[0]
    if( ibl ){
      this.enableRotation     .set(ibl.enableRotation     )
      this.enableBoxProjection.set(ibl.enableBoxProjection)
      this.iblFormat          .set(ibl.iblFormat          )
      this.shFormat           .set(ibl.shFormat           )
      this.hdrEncoding        .set(ibl.hdrEncoding        )
      this.mipLevelsValue     .set(ibl.mipLevels          )
      this.intensitiesValue   .set([
        ibl.intensity * ibl.ambiantIntensity, 
        ibl.intensity * ibl.specularIntensity
      ])
    } 
  }


  addLight(l: Ibl) {
    if (this.lights.length > 0){
      throw new Error("IblModel support only one Ibl Light")
    }
    super.addLight( l );

  }


  constructor( code : GlslCode, preCode : GlslCode ) {
    super( code, preCode );
    this.mipLevelsValue   = this.mipLevels.attachConstant(5)
    this.intensitiesValue = this.intensities.attachConstant([1,1])
    
    this.addChild( this.enableRotation      )
    this.addChild( this.enableBoxProjection )
    this.addChild( this.iblFormat           )
    this.addChild( this.shFormat            )
    this.addChild( this.hdrEncoding         )
    this.addChild( this.mipLevels           )
    this.addChild( this.intensities         )
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
