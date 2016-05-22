var expect  = require( 'expect.js' );


var Input     = require( '../lib/input' );
var ChunkList = require( '../lib/chunks-tree' );



describe( "Input", function(){

  var inputs;

  beforeEach( function(){
    inputs = new ChunkList()
  });

  describe( "float", function(){

    var input;

    beforeEach( function(){
      input = new Input( '_input', 1 )
      inputs.add( input );
    });


    it( 'should attach uniform float', function(){
      var u = input.attachUniform( 'uInput', 1 );

      inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.pv.code ).to.be( '#define HAS__input 1\n\n' );
    });

  });

});
