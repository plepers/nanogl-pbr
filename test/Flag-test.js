//@ts-check

var expect  = require( 'expect.js' );
var sinon  = require( 'sinon' );


import ChunkCollection, { DirtyFlag } from '../ChunkCollection'
import {CodeChunk} from './utils/TestChunks'
import Flag from '../Flag';


describe( "Flag", function(){

  let collection= new ChunkCollection('x')

  beforeEach( function(){
    collection = new ChunkCollection('x')
  });

  describe( "code gen", function(){

    var flag;


    beforeEach( function(){
      flag = new Flag( 'MyFlag' )
    });


    it( 'collection hash should be ok', function(){
      collection.add( flag );
      var code = collection.getCode();
      
      expect( code.hash ).to.be( 'xMyFlag0' );
    });


    it( 'collection num slots should be 1', function(){
      collection.add( flag );
      var code = collection.getCode();
      
      expect( code.slots.length ).to.be( 1 );
    });

    it( 'collection code should be ok', function(){
      collection.add( flag );
      var code = collection.getCode();
      expect( code.slots[0].code ).to.be( '#define MyFlag 0\n' );
    });


    it( 'collection code should be ok after change', function(){
      collection.add( flag );
      var code = collection.getCode();
      flag.enable()
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( '#define MyFlag 1\n' );
    });


    it( 'proxiing should be ok', function(){
      var proxy = new Flag( 'MyFlag', true )

      collection.add( flag );
      var code = collection.getCode();

      flag.proxy( proxy );

      code = collection.getCode();
      
      expect( code.slots[0].code ).to.be( '#define MyFlag 1\n' );
    });


  });

});
