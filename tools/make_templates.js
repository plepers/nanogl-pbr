

var glob       = require( 'glob' );
var replaceExt = require( 'replace-ext' );
var fs         = require( 'fs' );
var compiler   = require( './template' );

var sources = 'glsl/templates/*.+(vert|frag)';
 


function compile( path ){
  var jsPath = replaceExt( path, '.js' );

  var src = fs.readFile( path, {encoding:'utf-8'}, function(e, data){
    if( e ){ return };
    var js = compiler( data );
    fs.writeFile( jsPath, js, {encoding:'utf-8'}, function( e ){
      //done
    })
  });
}


glob( sources, function (er, files) {
  files.forEach( compile )
})