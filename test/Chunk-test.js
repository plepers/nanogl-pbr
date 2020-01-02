

var expect  = require( 'expect.js' );
var sinon  = require( 'sinon' );


import ChunkCollection, { DirtyFlag } from '../ChunkCollection'
import {CodeChunk} from './utils/TestChunks'


describe( "Chunk", function(){

  let collection= new ChunkCollection('x')

  beforeEach( function(){
    collection = new ChunkCollection('x')
  });

  describe( "code gen", function(){

    var chunk;

    beforeEach( function(){
      chunk = new CodeChunk( 'A' )
    });


    it( 'collection hash should be ok', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.hash ).to.be( 'x-A-' );
    });


    it( 'collection num slots should be 1', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.slots.length ).to.be( 1 );
    });

    it( 'collection code should be ok', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.slots[0].code ).to.be( 'A\n' );
    });

    it( 'collection code should be ok after change', function(){
      collection.add( chunk );
      var code;
      
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );
      
      chunk.setCode( 'B' );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'B\n' );
    });


  });


  describe( "proxy", function(){

    var chunk, proxy;

    beforeEach( function(){
      chunk = new CodeChunk( 'A' )
      proxy = new CodeChunk( 'B' )
      chunk.proxy( proxy );
    });



    it( 'collection hash should be ok', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.hash ).to.be( 'x-B-' );
    });


    it( 'collection num slots should be 1', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.slots.length ).to.be( 1 );
    });

    it( 'collection code should be ok', function(){
      collection.add( chunk );
      var code = collection.getCode();
      
      expect( code.slots[0].code ).to.be( 'B\n' );
    });

    it( 'collection code should be ok after change', function(){
      collection.add( chunk );
      var code;
      
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'B\n' );
      
      chunk.setCode( 'C' );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'B\n' );
    });


    it( 'removing proxy should be ok', function(){
      collection.add( chunk );
      var code;
      
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'B\n' );
      
      chunk.proxy( null );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );
    });

    it( 'removing proxy should be ok', function(){
      collection.add( chunk );
      var code;
      
      chunk.proxy( null );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );
    });


    it( 'removing proxy should invalidate', function(){
      collection.add( chunk );
      var code;
      code = collection.getCode();
      
      chunk.proxy( null );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );
    });


  });




  describe( "nested proxies", function(){

    var chunk, p1, p2, p3;

    beforeEach( function(){
      chunk = new CodeChunk( 'A' )
      p1 = new CodeChunk( 'B' )
      p2 = new CodeChunk( 'C' )
      p3 = new CodeChunk( 'D' )
      
    });



    it( 'proxiiing with proxied', function(){
      collection.add( chunk );
      p1.proxy( p2 );
      p2.proxy( p3 );
      var code;
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );
      
      chunk.proxy( p1 )
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'D\n' );
      
    });
    
    it( 'remove all chain', function(){
      collection.add( chunk );
      chunk.proxy( p1 )
      p1.proxy( p2 );
      p2.proxy( p3 );
      var code;
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'D\n' );
      
      chunk.proxy( null )
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'A\n' );

    });
    
    it( 'remove in chain', function(){
      collection.add( chunk );
      chunk.proxy( p1 )
      p1.proxy( p2 );
      p2.proxy( p3 );
      var code;
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'D\n' );
      
      p1.proxy( null )
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'B\n' );

    });
    

    it( 'remove in chain 2', function(){
      collection.add( chunk );
      chunk.proxy( p1 )
      p1.proxy( p2 );
      p2.proxy( p3 );
      var code;
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'D\n' );
      
      p2.proxy( null )
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 'C\n' );

    });


  });





  describe( "invalidation", function(){

    var chunk, proxy;

    beforeEach( function(){
      chunk = new CodeChunk( 'A' )
      proxy = new CodeChunk( 'B' )
      // chunk.proxy( proxy );
    });



    it( 'hierarchy should be invalid after adding chunk', function(){
      collection.add( chunk );
      collection.getCode();
      collection.add( new CodeChunk( 'X' ) );

      expect( collection._dirtyFlags ).to.be( DirtyFlag.Hierarchy );
    });


    it( 'hierarchy should be invalid after removing chunk', function(){
      collection.add( chunk );
      collection.add( new CodeChunk( 'X' ) );
      collection.getCode();
      collection.remove( chunk );

      expect( collection._dirtyFlags ).to.be( DirtyFlag.Hierarchy );
    });


    it( 'hierarchy should be invalid after proxiing chunk', function(){
      collection.add( chunk );
      collection.getCode();
      chunk.proxy( proxy );

      expect( collection._dirtyFlags ).to.be( DirtyFlag.Hierarchy );
    });


    it( 'code should be invalid after update chunk', function(){
      collection.add( chunk );
      collection.getCode();
      chunk.setCode('B');

      expect( collection._dirtyFlags ).to.be( DirtyFlag.Code );
    });


    it( 'dirty flags should be 0 after getCode', function(){
      collection.add( chunk );
      collection.getCode();

      expect( collection._dirtyFlags ).to.be( 0 );
    });

    it( 'dirty flags should be 0 when proxied chunk code change', function(){
      collection.add( chunk );
      chunk.proxy( proxy )
      collection.getCode();

      chunk.setCode( 'ABC' )
      //TODO: make this test pass
      // expect( collection._dirtyFlags ).to.be( 0 );
    });


    it( 'getCode twice should return the same object', function(){
      collection.add( chunk );
      var code1 = collection.getCode();
      var code2 = collection.getCode();
      
      expect( code1 === code2 ).to.be( true );
    });


    it( 'getCode twice should return the same object', function(){

      var collect_spy = sinon.spy(collection, "_collectChunks" );
      collection.add( chunk );
      collection.getCode();
      collection.getCode();
      
      expect( collect_spy.calledOnce ).to.be( true );
    });


    it( 'code invalidation should not recollect', function(){

      var collect_spy = sinon.spy(collection, "_collectChunks" );
      collection.add( chunk );
      collection.getCode();
      chunk.setCode('B');
      collection.getCode();
      
      expect( collect_spy.calledOnce ).to.be( true );
    });



  });


  describe( "shared chunks", function(){

    var chunk, proxy, collection2;

    beforeEach( function(){
      chunk = new CodeChunk( 'A' )
      proxy = new CodeChunk( 'C' )
      collection2 = new ChunkCollection('y')
      // chunk.proxy( proxy );
    });

  

    it( 'collections hash should be ok', function(){
      collection.add( chunk );
      collection2.add( chunk );
      var code1 = collection.getCode();
      var code2 = collection2.getCode();
      
      expect( code1.hash ).to.be( 'x-A-' );
      expect( code2.hash ).to.be( 'y-A-' );
    });


    it( 'collections num slots should be 1', function(){
      collection.add( chunk );
      collection2.add( chunk );
      var code1 = collection.getCode();
      var code2 = collection2.getCode();

      expect( code1.slots.length ).to.be( 1 );
      expect( code2.slots.length ).to.be( 1 );
    });

    
    it( 'collections code should be ok', function(){
      collection.add( chunk );
      collection2.add( chunk );
      var code1 = collection.getCode();
      var code2 = collection2.getCode();

    
      expect( code1.slots[0].code ).to.be( 'A\n' );
      expect( code2.slots[0].code ).to.be( 'A\n' );
    });


    it( 'collection code should be ok after change', function(){
      
      collection.add( chunk );
      collection2.add( chunk );
      
      collection.getCode();
      collection2.getCode();
      
      chunk.setCode( 'B' );
      
      var code1 = collection.getCode();
      var code2 = collection2.getCode();
      
      expect( code1.slots[0].code ).to.be( 'B\n' );
      expect( code2.slots[0].code ).to.be( 'B\n' );
    });


    it( 'shared proxy should be ok', function(){
      
      var c1 = new CodeChunk( 'A' )
      var c2 = new CodeChunk( 'B' )

      collection.add( c1 );
      collection2.add( c2 );
      
      var code1 = collection.getCode();
      var code2 = collection2.getCode();
      
      expect( code1.slots[0].code ).to.be( 'A\n' );
      expect( code2.slots[0].code ).to.be( 'B\n' );
      
      c1.proxy( proxy)
      c2.proxy( proxy)
      
      code1 = collection.getCode();
      code2 = collection2.getCode();
      
      expect( code1.slots[0].code ).to.be( 'C\n' );
      expect( code2.slots[0].code ).to.be( 'C\n' );
    });



  });




});
