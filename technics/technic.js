
var ChunksList   = require('./lib/chunks-tree' );



var __UID = 0;

function Technic( type ){
  this.type    = type;
  this._uid    = __UID++;
  this.inputs  = new ChunksList();
}


Technic.COLOR  = 'color';
Technic.DEPTH  = 'depth';
Technic.NORMAL = 'normal';


module.exports = Technic;

