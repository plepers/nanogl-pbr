var Node = require( 'nanogl-node' );


function Light(){
  Node.call( this );

  this._type  = 0;
  this._color = new Float32Array(3);
  this._wdir  = new Float32Array( this._wmatrix.buffer, 8*4, 3 );

  this._castShadows = false;
}


Light.prototype = Object.create( Node.prototype );
Light.prototype.constructor = Light;


Light.TYPE_DIR  = 1;
Light.TYPE_SPOT = 2;


module.exports = Light;