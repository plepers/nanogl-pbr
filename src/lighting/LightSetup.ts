import Enum from '../Enum'
import Bounds from '../Bounds'

import StandardModel from './StandardModel'
import Light from './Light'
import ILightModel from '../interfaces/ILightModel';
import DepthFormat, { DepthFormatEnum } from '../DepthFormatEnum';
import Chunk from '../Chunk';
import { GLContext } from 'nanogl/types';

/**
 * This class handles the setup of all lights.
 *
 * It manages the standard model and all other
 * registered global light models.
 */
class LightSetup {
  /** The list of lights */
  _lights     : Light[];
  /** The depth pass format */
  depthFormat : DepthFormatEnum;
  /** The bounds to use for lighting */
  bounds      : Bounds;
  /** The standard model */
  stdModel    : StandardModel;

  /** The list of light models */
  _models     : ILightModel[];
  /** The list of id / light model pairs */
  _modelsMap  : Record<string,ILightModel>;



  constructor() {

    this._lights = [];
    this._models = [];
    this._modelsMap = {};

    // depth encoding
    this.depthFormat = new Enum('depthFormat', DepthFormat);

    this.bounds = new Bounds();

    this.stdModel = new StandardModel();
    this._registerModel('std', this.stdModel);
  }


  /**
   * Add a light to the setup.
   *
   * This will add the light to the lights list
   * and to all the registered models.
   *
   * @param {Light} l The light to add
   */
  add(l:Light) {
    if (this._lights.indexOf(l) === -1) {
      this._lights.push(l);

      for (var i = 0; i < this._models.length; i++) {
        this._models[i].add(l);
      }
    }
  }

  /**
   * Remove a light from the setup.
   *
   * This will remove the light from the lights list
   * and from all the registered models.
   *
   * @param {Light} l The light to remove
   */
  remove(l:Light) {
    var i = this._lights.indexOf(l);
    if (i > -1) {
      this._lights.splice(i, 1);

      for (i = 0; i < this._models.length; i++) {
        this._models[i].remove(l);
      }
    }
  }

  /**
   * Prepare all registered models for rendering.
   * @param {GLContext} gl The webgl context to use
   */
  prepare( gl :GLContext ) {
    for (var i = 0; i < this._models.length; i++) {
      this._models[i].prepare(gl);
    }
  }

  /**
   * Get the shader chunks for the model correpsonding to the given id.
   * If no id is given, the standard model is used.
   *
   * @param {string} modelId The id of the model to use
   */
  getChunks( modelId : string ) : Chunk[] {
    if (modelId === undefined) {
      modelId = 'std';
    }

    var res = this._modelsMap[modelId].getChunks();
    res.unshift(this.depthFormat);
    return res;
  }

  /**
   * Register a light model to the setup.
   * If a model with the same id is already registered, it will not be replaced.
   *
   * @param id The id of the model
   * @param model The model to register
   */
  _registerModel(id : string , model : ILightModel ) {
    if (this._modelsMap[id] === undefined) {
      this._modelsMap[id] = model;
      this._models.push(model);
      model.setLightSetup( this );

      for (var i = 0; i < this._lights.length; i++) {
        model.add(this._lights[i]);
      }
    }
  }


}




export default LightSetup
