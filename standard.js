
var BaseMaterial = require( './material' );
var Input        = require( './chunk/input');
var Flag         = require( './chunk/flag');

var DepthPass = require('./technics/standard-depth' ),
    ColorPass = require('./technics/standard-color' ),
    Technic   = require('./technics/technic' );



function StandardMaterial( gl ){
  BaseMaterial.call( this, gl );

  this._mask = 1;

  this.ibl        = null;
  this.lightSetup = null;



  this._chunks = [
    this.iAlbedo         = new Input( 'albedo',          3 ),
    this.iSpecular       = new Input( 'specular',        3 ),
    this.iGloss          = new Input( 'gloss',           1 ),
    this.iNormal         = new Input( 'normal',          3 ),
    this.iOcclusion      = new Input( 'occlusion',       1 ),
    this.iCavity         = new Input( 'cavity',          1 ),
    this.iCavityStrength = new Input( 'cavityStrength',  2 ),
    this.iEmissive       = new Input( 'emissive',        1 ),
    this.iEmissiveScale  = new Input( 'emissiveScale',   1 ),
    this.iFresnel        = new Input( 'fresnel',         3 ),

    this.conserveEnergy  = new Flag ( 'conserveEnergy',  true  ),
    this.perVertexIrrad  = new Flag ( 'perVertexIrrad',  false ),
    this.glossNearest    = new Flag ( 'glossNearest',    false ),
    this.tonemap         = new Flag ( 'tonemap',         true  )
  ]


}




StandardMaterial.prototype = Object.create( BaseMaterial.prototype );
StandardMaterial.prototype.constructor = StandardMaterial;




StandardMaterial.prototype.setIBL = function( ibl ){
  this.ibl = ibl;
  var passes = this.getPassesPerType( Technic.COLOR );
  for (var i = 0; i < passes.length; i++) {
    passes[i].setIBL( ibl );
  }
};



StandardMaterial.prototype.setLightSetup = function( setup ){
  this.lightSetup = setup;
  var passes = this.getPassesPerType( Technic.COLOR );
  for (var i = 0; i < passes.length; i++) {
    passes[i].setLightSetup( ibl );
  }
};



StandardMaterial.prototype.createPass = function( technic ){
  var pass = null;

  switch( technic.type )
  {
    //              COLOR
    //===================
    case Technic.COLOR :
      pass = new ColorPass( this.gl, technic );
      pass.inputs.addChunks( this._chunks );
      if( this.ibl ) {
        pass.setIBL( this.ibl );
      }
      if( this.lightSetup ) {
        pass.setLightSetup( this.lightSetup );
      }
      break;

    //              DEPTH
    //===================
    case Technic.DEPTH :
      pass = new DepthPass( this.gl, technic );
      break;

  }
  return pass;
};





module.exports = StandardMaterial;