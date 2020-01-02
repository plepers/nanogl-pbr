

var expect  = require( 'expect.js' );
var sinon  = require( 'sinon' );


import ChunkCollection, { DirtyFlag } from '../ChunkCollection'
import {CodeChunk} from './utils/TestChunks'
import Enum from '../Enum';


describe( "Enum", function(){

  let collection= new ChunkCollection('x')

  beforeEach( function(){
    collection = new ChunkCollection('x')
  });

  describe( "code gen", function(){

    var penum;
    const ecode = 
`#define A 1
#define B 2
#define C 3

#define VAL_MyEnum A
#define MyEnum(k) VAL_MyEnum == k
`;

    beforeEach( function(){
      penum = new Enum( 'MyEnum', ['A', 'B', 'C'] )

    });


    it( 'collection hash should be ok', function(){
      collection.add( penum );
      var code = collection.getCode();
      
      expect( code.hash ).to.be( 'xMyEnum0' );
    });


    it( 'collection num slots should be 1', function(){
      collection.add( penum );
      var code = collection.getCode();
      
      expect( code.slots.length ).to.be( 1 );
    });

    it( 'collection code should be ok', function(){
      collection.add( penum );
      var code = collection.getCode();
      console.log(  code.slots[0].code )
      expect( code.slots[0].code ).to.be( ecode );
    });


    it( 'collection code should be ok after change', function(){
      collection.add( penum );
      var code = collection.getCode();
      penum.set( 'B' )
      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 
`#define A 1
#define B 2
#define C 3

#define VAL_MyEnum B
#define MyEnum(k) VAL_MyEnum == k
`);
    });


    it( 'proxiing should be ok', function(){
      var proxy = new Enum( 'MyEnum', ['A', 'B', 'C'] )
      proxy.set( 'B' );

      collection.add( penum );
      var code = collection.getCode();

      penum.proxy( proxy );

      code = collection.getCode();
      expect( code.slots[0].code ).to.be( 
`#define A 1
#define B 2
#define C 3

#define VAL_MyEnum B
#define MyEnum(k) VAL_MyEnum == k
`);
    });


  });

});
