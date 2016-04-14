function log(a){
  var chunks = {
    pv : '',
    v  : '',
    pf : '',
    f  : ''
  }
  a.genCode( chunks)

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

var Input = require( './lib/input' );


var a = new Input( 'color', 3 );
var u = new Input.Uniform( 'uColor', 4 )
a.attach( u, 'rgb' )
log( a )


var s = new Input.Sampler( 'tColor', 'vTexCoord0' )
a.attach( s, 'rgb' )
log( a )


var at = new Input.Attribute( 'aColor0', 4 );
a.attach( at, 'rgb' )
log( a )


var c = new Input.Constant( [ 1, 2, 3, 4 ] );
a.attach( c, 'rgb' )
log( a )

// a.useSampler( 'tex', 'gba', 'customUvs' )
// log( a )


// a.useAttribute( 'bgr', 'aColor', 4 )
// log( a )
