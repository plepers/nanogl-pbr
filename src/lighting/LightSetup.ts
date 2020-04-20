import Enum from '../Enum'
import Bounds from '../Bounds'

import StandardModel from './StandardModel'
import Light from './Light'
import ILightModel from '../interfaces/ILightModel';
import DepthFormat, { DepthFormatEnum } from '../DepthFormatEnum';
import Chunk from '../Chunk';
import { GLContext } from 'nanogl/types';

class LightSetup {

  _lights     : Light[];
  depthFormat : DepthFormatEnum;
  bounds      : Bounds;
  stdModel    : StandardModel;

  _models     : ILightModel[];
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



  add(l:Light) {
    if (this._lights.indexOf(l) === -1) {
      this._lights.push(l);

      for (var i = 0; i < this._models.length; i++) {
        this._models[i].add(l);
      }
    }
  }


  remove(l:Light) {
    var i = this._lights.indexOf(l);
    if (i > -1) {
      this._lights.splice(i, 1);

      for (i = 0; i < this._models.length; i++) {
        this._models[i].remove(l);
      }
    }
  }


  prepare( gl :GLContext ) {
    for (var i = 0; i < this._models.length; i++) {
      this._models[i].prepare(gl);
    }

  }


  getChunks( modelId : string ) : Chunk[] {
    if (modelId === undefined) {
      modelId = 'std';
    }

    var res = this._modelsMap[modelId].getChunks();
    res.unshift(this.depthFormat);
    return res;
  }


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
