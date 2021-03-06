import { ShadowMappedLightModel } from "./AbstractLightModel";
import SpotLight from "./SpotLight";
import { GlslCode } from "../interfaces/GlslCode";
import LightType from "./LightType";
import StandardModel from "./StandardModel";
import Program from "nanogl/program";
import { GLContext } from "nanogl/types";



export default class SpotLightModel extends ShadowMappedLightModel<SpotLight> {


  readonly type = LightType.SPOT

  _directions: Float32Array | null
  _colors    : Float32Array | null
  _positions : Float32Array | null
  _cone      : Float32Array | null

  constructor(code : GlslCode, preCode : GlslCode) {
    super(code, preCode);

    this._directions = null;
    this._colors = null;
    this._positions = null;
    this._cone = null;
  }





  genCodePerLights(light: SpotLight, index: number, shadowIndex: number) {
    var o = {
      index: index,
      shadowIndex: shadowIndex,
      infinite: light.radius<=0,
    }
    return this.codeTemplate(o);
  }

  allocate(n: number) {

    if (this._colors === null || this._colors.length / 4 !== n) {
      this._directions = new Float32Array(n * 4);
      this._colors     = new Float32Array(n * 4);
      this._positions  = new Float32Array(n * 3);
      this._cone       = new Float32Array(n * 2);
    }
  }


  prepare( gl : GLContext, model: StandardModel) {
    const lights = this.lights;
    this.allocate(lights.length);

    for (var i = 0; i < lights.length; i++) {
      var l = lights[i]
      this._directions!.set(l._wdir       , i * 4)
      this._colors    !.set(l._color      , i * 4)
      this._positions !.set(l._wposition  , i * 3)
      this._cone      !.set(l._coneData   , i * 2)

      this._directions![i * 4 + 3] = l.radius;
      this._colors![i * 4 + 3] = l.iblShadowing;

      if (l._castShadows) {
        l.initShadowmap( gl );
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

      prg.uLSpotDirections(this._directions);
      prg.uLSpotColors(this._colors);
      prg.uLSpotPositions(this._positions);
      prg.uLSpotCone(this._cone);

      this._invalid = false;
    }
  }

}
