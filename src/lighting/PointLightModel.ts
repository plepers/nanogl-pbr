import AbstractLightModel from "./AbstractLightModel";
import PointLight from "./PointLight";
import { GlslCode } from "../interfaces/GlslCode";
import LightType from "./LightType";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
import { GLContext } from "nanogl/types";


export default class PointLightModel extends AbstractLightModel<PointLight> {

  readonly type = LightType.POINT

  _colors   : Float32Array | null;
  _positions: Float32Array | null;

  constructor(code : GlslCode, preCode : GlslCode) {
    super(code, preCode);

    this._colors = null;
    this._positions = null;
  }



  genCodePerLights(light: PointLight, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex,
      infinite: light.radius<=0,
    }
    return this.codeTemplate(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 3 !== n) {
      this._colors    = new Float32Array(n * 3);
      this._positions = new Float32Array(n * 4);
    }
  }


  prepare( gl : GLContext, model:StandardModel) {

    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._colors   !.set(l._color      , i * 3)
      this._positions!.set(l._wposition  , i * 4)

      this._positions![i*4+3] = 1.0/(l.radius*l.radius);

      // if (l._castShadows) {
      //   l.initShadowmap( gl );
      //   var shIndex = model.shadowChunk.addLight(l);
      //   if (this.shadowIndices[i] !== shIndex) {
      //     this.invalidateCode();
      //   }
      //   this.shadowIndices[i] = shIndex;
      // } else {
        this.shadowIndices[i] = -1;
      // }
    }

    this._invalid = true;
  }


  setup(prg: Program) {

    if (this.lights.length > 0) {
      super.setup(prg);

      prg.uLPointColors(this._colors);
      prg.uLPointPositions(this._positions);

      this._invalid = false;
    }
  }

}