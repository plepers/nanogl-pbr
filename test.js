
var Input     = require( './lib/input' );
var InputList = require( './lib/input-list' );


function log(il){

  il.compile()
  
  var chunks = il.getChunks();

  console.log( '===============================\n' )
  console.log( 'PV -------------' )
  console.log(chunks.pv)
  console.log( 'V  -------------' )
  console.log(chunks.v )
  console.log( 'PF -------------' )
  console.log(chunks.pf)
  console.log( 'F  -------------' )
  console.log(chunks.f )
}



var inputs      = new InputList();
var iAlbedo     = inputs.add( 'albedo',    3 );
var iSpecular   = inputs.add( 'specular',  3 );
var iRoughness  = inputs.add( 'roughness', 1 );
var iNormal     = inputs.add( 'normal',    3 );
var iOcclusion  = inputs.add( 'occlusion', 1 );


var albedo    = iAlbedo   .attachSampler  ( 'tAlbedo'    , 'vTexCoord0' );
var specular  = iSpecular .attachUniform  ( 'uSpecular'  );
var roughness = iRoughness.attachAttribute( 'aRoughness' );
var normals   = iNormal   .attachConstant ( [1, 2, 3.123456789] );
// var occlusion = iOcclusion.attachSampler  ( 'tOcclusion' , 'vTexCoord0' );

log( inputs )