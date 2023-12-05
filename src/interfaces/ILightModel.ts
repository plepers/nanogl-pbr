import Light from "../lighting/Light";
import Chunk from "../Chunk";
import LightSetup from "../lighting/LightSetup";
import { GlslCode } from "./GlslCode";
import { GLContext } from "nanogl/types";

/**
 * This interface represents a global light model.
 */
export default interface ILightModel{
  /**
   * Set the light model setup.
   * @param {LightSetup} ls The light model setup to use
   */
  setLightSetup( ls : LightSetup ) : void;
  /**
   * Get the light model setup.
   */
  getLightSetup():LightSetup;

  /**
   * Add a light to the model.
   * @param {Light} l The light to add
   */
  add   ( l : Light ) : void;
  /**
   * Remove a light from the model.
   * @param {Light} l The light to remove
   */
  remove( l : Light ) : void;

  /**
   * Prepare the light model for rendering.
   * @param {GLContext} gl The webgl context to use
   */
  prepare( gl : GLContext ) : void;
  /**
   * Get the shader chunks for the light model.
   */
  getChunks() : Chunk[];

}

/**
 * This interface represents the code for a global light model.
 */
export interface ILightModelCode{
  /** The shader pre-code for directional lighting. */
  dirPreCode     : GlslCode;
  /** The shader pre-code for spot lighting. */
  spotPreCode    : GlslCode;
  /** The shader pre-code for point lighting. */
  pointPreCode   : GlslCode;

  /** The shader code for directional lighting. */
  dirLightCode   : GlslCode;
  /** The shader code for spot lighting. */
  spotLightCode  : GlslCode;
  /** The shader code for point lighting. */
  pointLightCode : GlslCode;

  /** The shader pre-code for shadow maps. */
  shadPreCode    : GlslCode;
  /** The shader code for setup before lighting. */
  preLightCode   : GlslCode;
  /** The shader code for setup after lighting. */
  postLightCode  : GlslCode;

  /** The shader pre-code for IBL. */
  iblPreCode : GlslCode;
  /** The shader code for IBL. */
  iblCode    : GlslCode;

}