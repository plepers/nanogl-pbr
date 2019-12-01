import NGLProgram from 'nanogl/program'

import { GLContext } from 'nanogl/types';
import IMaterial from './interfaces/material';
// import {GLContext} = require('nanogl/types');


class Program extends NGLProgram {

  _usage : number;
  _currentMaterial : IMaterial | null;

  constructor(gl : GLContext, vert?: string, frag?: string, defs?: string) {
    super(gl, vert, frag, defs);
    this._usage = 0;
    this._currentMaterial = null;
  }

  setupInputs(material : IMaterial) {
    var params = material.inputs._setups;

    // update only _invalid inputs
    // todo for textures, etx must be rebound to unit
    var forceUpdate = true;//material !== this._currentMaterial;

    for (var i = 0; i < params.length; i++) {
      if (params[i]._invalid || forceUpdate) {
        params[i].setup(this);
      }
    }

    this._currentMaterial = material;
  }
}


export default Program