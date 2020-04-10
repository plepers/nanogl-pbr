//@ts-check

var expect  = require( 'expect.js' );
var sinon  = require( 'sinon' );

import hashBuilder from '../Hash';


describe( "Hash", function(){


  describe( "string hash", function(){

    it( ' should be ok', function(){
      var a = hashBuilder.start().hashString('a').get();
      expect( a ).not.to.be.equal( NaN )
    });

    it( '2 string should be deferent', function(){
      var a = hashBuilder.start().hashString('abcd').get();
      var b = hashBuilder.start().hashString('abce').get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 chars should be deferent', function(){
      var a = hashBuilder.start().hashString('a').get();
      var b = hashBuilder.start().hashString('b').get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 same strings should be equal', function(){
      var a = hashBuilder.start().hashString('aezraezr').get();
      var b = hashBuilder.start().hashString('aezraezr').get();
      expect( a ).to.be.equal( b )
    });

    it( '2 same chars should be equal', function(){
      var a = hashBuilder.start().hashString('c').get();
      var b = hashBuilder.start().hashString('c').get();
      expect( a ).to.be.equal( b )
    });

  });

  describe( "number hash", function(){

    it( '  should be ok', function(){
      var a = hashBuilder.start().hashNumber(1).get();
      expect( a ).not.to.be.equal( NaN )
    });

    it( '2 numbers should be deferent', function(){
      var a = hashBuilder.start().hashNumber(1).get();
      var b = hashBuilder.start().hashNumber(2).get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 neg numbers should be deferent', function(){
      var a = hashBuilder.start().hashNumber(1).get();
      var b = hashBuilder.start().hashNumber(-1).get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 neg numbers should be deferent', function(){
      var a = hashBuilder.start().hashNumber(100).get();
      var b = hashBuilder.start().hashNumber(-100).get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 same numbers should be equal', function(){
      var a = hashBuilder.start().hashNumber(100).get();
      var b = hashBuilder.start().hashNumber(100).get();
      expect( a ).to.be.equal( b )
    });

  });

  describe( "array hash", function(){


    it( '2 f32[4] should be deferent', function(){
      var a = hashBuilder.start().hashView( new Float32Array([1, 2, 3, 4])).get();
      var b = hashBuilder.start().hashView( new Float32Array([1, 2, 2, 4])).get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 f32[1] should be deferent', function(){
      var a = hashBuilder.start().hashView( new Float32Array([1])).get();
      var b = hashBuilder.start().hashView( new Float32Array([2])).get();
      expect( a ).not.to.be.equal( b )
    });

    it( '2 same f32[1] should be equal', function(){
      var a = hashBuilder.start().hashView( new Float32Array([1])).get();
      var b = hashBuilder.start().hashView( new Float32Array([1])).get();
      expect( a ).to.be.equal( b )
    });

    it( 'odd u8 should be ok', function(){
      var a = hashBuilder.start().hashView( new Uint8Array([1, 2, 3])).get();
      expect( a ).not.to.be.equal( NaN )
    });
    
    it( '2 odd u8 should be deferent', function(){
      var a = hashBuilder.start().hashView( new Uint8Array([1, 2, 3])).get();
      var b = hashBuilder.start().hashView( new Uint8Array([1, 5, 3])).get();
      expect( a ).not.to.be.equal( b )
    });
    
    it( '2 same odd u8 should be equal', function(){
      var a = hashBuilder.start().hashView( new Uint8Array([1, 2, 3])).get();
      var b = hashBuilder.start().hashView( new Uint8Array([1, 2, 3])).get();
      expect( a ).to.be.equal( b )
    });

  

  });


  // describe( "testCollision", function(){
  
  //   it( 'test', function(){

  //     const set = new Set()
  //     for( var i = 0; i < 1000000; i++ ){

  //       var hash = hashBuilder.hashNumber( Math.random() ).get();
  //       if( set.has( hash ) ) throw new Error('collision at '+i)
  //       set.add( hash );
  //     }
  //   });

  
  // });

});
