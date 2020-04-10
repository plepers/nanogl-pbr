import Light, { ShadowMappedLight } from "./Light";
import Chunk from "../Chunk";
import LightType from "./LightType";
import ChunksSlots from "../ChunksSlots";
import ILightModel from "../interfaces/ILightModel";
import Program from "nanogl/program";
import { GlslCode } from "../interfaces/GlslCode";

export default abstract class AbstractLightModel<TLight extends Light = Light> extends Chunk {

  abstract readonly type: LightType

  lights: TLight[]
  shadowIndices: number[];

  preCodeTemplate: GlslCode;
  codeTemplate   : GlslCode;


  constructor( code : GlslCode, preCode : GlslCode) {
    super(true, true);

    this.lights = [];
    this.shadowIndices = [];
    this.preCodeTemplate = preCode;
    this.codeTemplate    = code;
  }



  addLight(l: TLight) {
    if (this.lights.indexOf(l) === -1) {
      this.lights.push(l);
      this.shadowIndices.push(-1)
      this.invalidateCode();
    }
  }


  removeLight(l: TLight) {
    const i = this.lights.indexOf(l);
    if (i > -1) {
      this.lights.splice(i, 1);
      this.shadowIndices.splice(i, 1);
      this.invalidateCode()
    }
  }


  _genCode(slots: ChunksSlots) {

    let code = this.preCodeTemplate({
      count: this.lights.length
    });
    slots.add('pf', code);

    code = ''
    for (var i = 0; i < this.lights.length; i++) {
      code += this.genCodePerLights(this.lights[i], i, this.shadowIndices[i]);
    }

    slots.add('lightsf', code);
  }


  abstract genCodePerLights(light: TLight, index: number, shadowIndex: number): string;
  abstract update( model : ILightModel ) : void;


}



type _ShadowMappedLight = ShadowMappedLight&Light;
export abstract class ShadowMappedLightModel<TLight extends _ShadowMappedLight> extends AbstractLightModel<TLight>{

  setup(prg: Program) {
    for (var i = 0; i < this.shadowIndices.length; i++) {
      var si = this.shadowIndices[i]
      if (si > -1) {
        var tex = this.lights[i].getShadowmap( prg.gl );
        prg['tShadowMap' + si](tex);
      }
    }
  }

}