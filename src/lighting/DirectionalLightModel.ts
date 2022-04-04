import DirectionalLight from "./DirectionalLight";
import LightType from "./LightType";
import Light from "./Light";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
import { ShadowMappedLightModel } from './AbstractLightModel'
import { GlslCode } from "../interfaces/GlslCode";
import { GLContext } from "nanogl/types";

export default class DirectionalLightModel extends ShadowMappedLightModel<DirectionalLight> {

  readonly type = LightType.DIRECTIONAL;

  _directions: Float32Array | null
  _colors: Float32Array | null

  constructor( code : GlslCode, preCode : GlslCode ) {
    super(code, preCode);

    this._directions = null;
    this._colors = null;
  }



  genCodePerLights(light: Light, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex
    }
    return this.codeTemplate(o);
  }


  allocate(n: number) {

    if (this._colors === null || this._colors.length / 4 !== n) {
      this._directions = new Float32Array(n * 3);
      this._colors = new Float32Array(n * 4);
    }
  }


  prepare( gl : GLContext, model: StandardModel) {
    var lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._directions!.set(l._wdir, i * 3)
      this._colors!.set(l._color, i * 4)
      this._colors![i * 4 + 3] = l.iblShadowing;

      if (l.castShadows) {
        l.initShadowmap(gl);
        var shIndex = model.shadowChunk.addLight(l);
        if (this.shadowIndices[i] !== shIndex) {
          this.invalidateCode();
        }
        this.shadowIndices[i] = shIndex;
      } else {
        this.shadowIndices[i] = -1;
      }

    }

    this._invalid = true;
  }


  setup(prg: Program) {

    if (this.lights.length > 0) {
      super.setup(prg);

      prg.uLDirDirections(this._directions);
      prg.uLDirColors(this._colors);
      this._invalid = false;
    }
  }


}

