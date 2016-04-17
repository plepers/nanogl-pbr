var NGLProgram = require( 'nanogl/program' );


function Program( gl, v, f, defs ){
  NGLProgram.call( this, gl, v, f, defs );

  this._usage = 0;
  this._currentMaterial = null;
}


Program.prototype = Object.create( NGLProgram.prototype );
Program.prototype.constructor = Program;


Program.prototype.setupInputs = function( material ){
  var params = material.inputs._params;

  // update only _invalid inputs
  // todo for textures, etx must be rebound to unit
  var forceUpdate = true;//material !== this._currentMaterial;

  for (var i = 0; i < params.length; i++) {
    if( params[i]._invalid || forceUpdate ){
      params[i]._apply( this )
    }
  }

  this._currentMaterial = material;
}


module.exports = Program;