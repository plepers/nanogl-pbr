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
      expect( codes.slotsMap.definitions.code ).to.be( '#define HAS__input 1\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'uniform float uInput;\n\n#define _input(k) uInput\n' );
      expect( codes.slotsMap.v  ).to.be( undefined );
      expect( codes.slotsMap.f  ).to.be( undefined );
    });


    it( 'should attach attribute float', function(){
      var u = input.attachAttribute( 'aInput', 1 );

      inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.pv.code ).to.be( 'attribute float aInput;\nvarying   float v_aInput;\n\n' );
      expect( codes.slotsMap.v.code  ).to.be( 'v_aInput = aInput;\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'varying float v_aInput;\n\n#define _input(k) v_aInput\n' );
      expect( codes.slotsMap.f  ).to.be( undefined );

    });


    it( 'should attach sampler float', function(){
      var u = input.attachSampler( 'tInput', 'vTexCoord' );

      inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.definitions.code ).to.be( '#define HAS__input 1\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'uniform sampler2D tInput;\n\n#define _input(k) VAL_tInputvTexCoord.r\n' );
      expect( codes.slotsMap.f.code  ).to.be( 'vec4 VAL_tInputvTexCoord = texture2D( tInput, vTexCoord);\n\n' );
      expect( codes.slotsMap.v  ).to.be( undefined );

    });


    it( 'should attach sampler float', function(){

      var attr = new Input.Attribute( 'aTexcoord10', 2 );
      var u = input.attachSampler( 'tInput', attr );

      inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.pv.code ).to.be( 'attribute vec2 aTexcoord10;\nvarying   vec2 v_aTexcoord10;\n\n' );
      expect( codes.slotsMap.v.code  ).to.be( 'v_aTexcoord10 = aTexcoord10;\n\n' );

      expect( codes.slotsMap.pf.code ).to.be( 'varying vec2 v_aTexcoord10;\n\nuniform sampler2D tInput;\n\n#define _input(k) VAL_tInputv_aTexcoord10.r\n' );
      expect( codes.slotsMap.f.code  ).to.be( 'vec4 VAL_tInputv_aTexcoord10 = texture2D( tInput, v_aTexcoord10);\n\n' );

    });



  });

});
