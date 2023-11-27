import Light, { ShadowMappedLight } from "./Light";
import Chunk from "../Chunk";
import LightType from "./LightType";
import ChunksSlots from "../ChunksSlots";
import ILightModel from "../interfaces/ILightModel";
import Program from "nanogl/program";
import { GlslCode } from "../interfaces/GlslCode";
import { GLContext } from "nanogl/types";

/**
 * This class is the base class for light models.
 */
export default abstract class AbstractLightModel<TLight extends Light = Light> extends Chunk {
  /** The type of lighting */
  abstract readonly type: LightType

  /** The list of lights */
  lights: TLight[]
  /** The list of shadow index for each light */
  shadowIndices: number[];

  /** The shader pre-code template for this light model */
  preCodeTemplate: GlslCode;
  /** The shader code template for this light model */
  codeTemplate   : GlslCode;


  /**
   * @param {GlslCode} code The shader code template for this light model
   * @param {GlslCode} preCode The shader pre-code template for this light model
   */
  constructor( code : GlslCode, preCode : GlslCode) {
    super(true, true);

    this.lights = [];
    this.shadowIndices = [];
    this.preCodeTemplate = preCode;
    this.codeTemplate    = code;
  }


  /**
   * Add a light to the model.
   * @param {TLight} l The light to add
   */
  addLight(l: TLight) {
    if (this.lights.indexOf(l) === -1) {
      this.lights.push(l);
      this.shadowIndices.push(-1)
      this.invalidateCode();
    }
  }

  /**
   * Remove a light from the model.
   * @param {TLight} l The light to remove
   */
  removeLight(l: TLight) {
    const i = this.lights.indexOf(l);
    if (i > -1) {
      this.lights.splice(i, 1);
      this.shadowIndices.splice(i, 1);
      this.invalidateCode()
    }
  }

  /**
   * Generate the shader code for this light model.
   * @param {ChunksSlots} slots The slots to add the code to
   */
  _genCode(slots: ChunksSlots) {

    if( this.lights.length == 0 ) return;

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

  /**
   * Generate the shader code for a given light in this LightModel.
   * @param {ChunksSlots} slots The slots to add the code to
   * @param {number} index The index of the light
   * @param {number} shadowIndex The shadow index of the light
   */
  abstract genCodePerLights(light: TLight, index: number, shadowIndex: number): string;

  /**
   * Prepare the light model for rendering.
   * @param {GLContext} gl The webgl context to use
   * @param {ILightModel} model The parent light model
   */
  abstract prepare( gl : GLContext, model : ILightModel ) : void;


}



type _ShadowMappedLight = ShadowMappedLight&Light;
/**
 * This class is the base class for shadow mapped light models.
 */
export abstract class ShadowMappedLightModel<TLight extends _ShadowMappedLight> extends AbstractLightModel<TLight>{
  /**
   * Setup the given program for this light model.
   * @param {Program} prg The program to setup
   */
  setup(prg: Program) {
    for (var i = 0; i < this.shadowIndices.length; i++) {
      var si = this.shadowIndices[i]
      if (si > -1) {
        var tex = this.lights[i].getShadowmap();
        prg['tShadowMap' + si](tex);
      }
    }
  }

}