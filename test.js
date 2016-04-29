
var Input     = require( './lib/input' );
var ChunkList = require( './lib/chunks-tree' );


function log(il){

  il.compile()

  var chunks = il.getCode();

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



var inputs      = new ChunkList();
var iAlbedo     = inputs.add( new Input( 'albedo',    3 ) );
var iSpecular   = inputs.add( new Input( 'specular',  3 ) );
var iRoughness  = inputs.add( new Input( 'roughness', 1 ) );
var iNormal     = inputs.add( new Input( 'normal',    3 ) );
var iOcclusion  = inputs.add( new Input( 'occlusion', 1 ) );


var albedo    = iAlbedo   .attachSampler  ( 'tAlbedo'    , 'vTexCoord0' );
var specular  = iSpecular .attachUniform  ( 'uSpecular'  );
var roughness = iRoughness.attachAttribute( 'aRoughness' );
var normals   = iNormal   .attachConstant ( [1, 2, 3.123456789] );
// var occlusion = iOcclusion.attachSampler  ( 'tOcclusion' , 'vTexCoord0' );



log( inputs )


/// ------------------------------------
var tpl = require( './glsl/templates/directional-light' );
console.log( tpl({
  index:1,
  shadowIndex:-1
}) )