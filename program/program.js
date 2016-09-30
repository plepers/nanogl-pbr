var NGLProgram = require( 'nanogl/program' );


function Program( gl, v, f, defs ){
  NGLProgram.call( this, gl, v, f, defs );

  this._usage = 0;
  this._currentPass = null;
}


Program.prototype = Object.create( NGLProgram.prototype );
Program.prototype.constructor = Program;


Program.prototype.setupInputs = function( pass ){
  var params = pass.inputs._setups;

  // update only _invalid inputs
  // todo for textures, etx must be rebound to unit
  var forceUpdate = true;//pass !== this._currentPass;

  for (var i = 0; i < params.length; i++) {
    if( params[i]._invalid || forceUpdate ){
      params[i].setup( this );
    }
  }

  this._currentPass = pass;
};


module.exports = Program;