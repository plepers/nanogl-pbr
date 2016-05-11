
var Input  = require( './lib/input' );
var Flag   = require( './lib/flag' );


function IBL( env, sh ){
  this.env   = env;
  this.sh    = sh;

  this._expoInput   = new Input( 'iblExpo', 2 );

}

IBL.prototype = {


  getChunks : function(){
    return [
      this._expoInput  .createProxy()
    ];
  },


  setupProgram : function( prg ){
    prg.tEnv(       this.env );
    prg.uSHCoeffs(  this.sh  );
  }


}

IBL.convert = function( sh ){
  var SqrtPI = Math.sqrt(Math.PI);
  var C0 = 1.0 / (2 * SqrtPI);
  var C1 = Math.sqrt(3) / (3 * SqrtPI);
  var C2 = Math.sqrt(15) / (8 * SqrtPI);
  var C3 = Math.sqrt(5) / (16 * SqrtPI);
  var C4 = .5 * C2;

  var res = new Float32Array(7 * 4);

  // R
  res[0]  =     C1 * sh[2 * 3 + 0];
  res[1]  =   - C1 * sh[1 * 3 + 0];
  res[2]  =   - C1 * sh[3 * 3 + 0];
  res[3]  =     C0 * sh[0 * 3 + 0] - C3 * sh[6 * 3 + 0];

  // G
  res[4]  =     C1 * sh[2 * 3 + 1];
  res[5]  =   - C1 * sh[1 * 3 + 1];
  res[6]  =   - C1 * sh[3 * 3 + 1];
  res[7]  =     C0 * sh[0 * 3 + 1] - C3 * sh[6 * 3 + 1];

  // B
  res[8]  =     C1 * sh[2 * 3 + 2];
  res[9]  =   - C1 * sh[1 * 3 + 2];
  res[10] =   - C1 * sh[3 * 3 + 2];
  res[11] =     C0 * sh[0 * 3 + 2] - C3 * sh[6 * 3 + 2];

  res[12] =     C2 * sh[4 * 3 + 0];
  res[13] =   - C2 * sh[5 * 3 + 0];
  res[14] = 3 * C3 * sh[6 * 3 + 0]; //
  res[15] =   - C2 * sh[7 * 3 + 0];

  res[16] =     C2 * sh[4 * 3 + 1];
  res[17] =   - C2 * sh[5 * 3 + 1];
  res[18] = 3 * C3 * sh[6 * 3 + 1]; //
  res[19] =   - C2 * sh[7 * 3 + 1];

  res[20] =     C2 * sh[4 * 3 + 2];
  res[21] =   - C2 * sh[5 * 3 + 2];
  res[22] = 3 * C3 * sh[6 * 3 + 2]; //
  res[23] =   - C2 * sh[7 * 3 + 2];

  res[24] =     C4 * sh[8 * 3 + 0]; //
  res[25] =     C4 * sh[8 * 3 + 1]; //
  res[26] =     C4 * sh[8 * 3 + 2]; //
  res[27] =     1; //

  return res;
}

module.exports = IBL;
