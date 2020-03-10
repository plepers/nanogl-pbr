




function swizzleGen( comps ) {

  const COMPONENTS = comps;

  var code0 = 0;
  var code1 = 0;
  var code2 = 0;
  var code3 = 0;

  var swizzles = [];


  for (var i = 0; i <= 0xff; i++) {

    code3 = (i >> 6) & 3;
    code2 = (i >> 4) & 3;
    code1 = (i >> 2) & 3;
    code0 = i & 3;


    swizzles.push( COMPONENTS[code0] + COMPONENTS[code1] + COMPONENTS[code2] + COMPONENTS[code3] );

    if (code2 == code3) {

      swizzles.push( COMPONENTS[code0] + COMPONENTS[code1] + COMPONENTS[code2] );

      if (code1 == code3) {

        swizzles.push( COMPONENTS[code0] + COMPONENTS[code1] );
        
        if (code0 == code3) {
          swizzles.push( COMPONENTS[code0] );
        }
        
      }

      
    }


  

  }
  return swizzles;
}

var swizzles = [];

swizzles = swizzles.concat( swizzleGen( ["x", "y", "z", "w"] ) );
swizzles = swizzles.concat( swizzleGen( ["r", "g", "b", "a"] ) );

var allSwizzles = swizzles.map( s=>`'${s}'` ).join('|'); 

var code = `type Swizzle = ${allSwizzles}`;

console.log( code );