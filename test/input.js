//@ts-check

var expect  = require( 'expect.js' );


import Input, { Sampler }    from '../Input'
import ChunkCollection from '../ChunkCollection'
import TexCoord from '../TexCoord';



describe( "Input", function(){

  var inputs;

  beforeEach( function(){
    inputs = new ChunkCollection()
  });

  describe( "float", function(){

    var input;

    beforeEach( function(){
      input = new Input( '_input', 1 )
      inputs.add( input );
    });


    it( 'should attach uniform float', function(){
      var u = input.attachUniform( 'uInput', 1 );

    //   inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.definitions.code ).to.be( '#define HAS__input 1\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'uniform float uInput;\n\n#define _input(k) uInput\n' );
      expect( codes.slotsMap.v  ).to.be( undefined );
      expect( codes.slotsMap.f  ).to.be( undefined );
    });


    it( 'should attach attribute float', function(){
      var u = input.attachAttribute( 'aInput', 1 );

    //   inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.pv.code ).to.be( 'IN float aInput;\nOUT float v_aInput;\n\n' );
      expect( codes.slotsMap.v.code  ).to.be( 'v_aInput = aInput;\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'IN float v_aInput;\n\n#define _input(k) v_aInput\n' );
      expect( codes.slotsMap.f  ).to.be( undefined );

    });


    it( 'should attach sampler float', function(){
      var u = input.attachSampler( 'tInput', 'vTexCoord' );

    //   inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.definitions.code ).to.be( '#define HAS__input 1\n\n' );
      expect( codes.slotsMap.pf.code ).to.be( 'uniform sampler2D tInput;\n\n#define _input(k) VAL_tInputvTexCoord.r\n#define _input_texCoord(k) vTexCoord\n' );
      expect( codes.slotsMap.f.code  ).to.be( 'vec4 VAL_tInputvTexCoord = texture2D( tInput, vTexCoord);\n\n' );
      expect( codes.slotsMap.v  ).to.be( undefined );

    });


    it( 'should attach sampler float', function(){

      var u = input.attachSampler( 'tInput', TexCoord.create( 'aTexCoord3') );

    //   inputs.compile()
      var codes = inputs.getCode();
      expect( codes.slotsMap.pv ).to.be.ok()
      expect( codes.slotsMap.v  ).to.be.ok()

      expect( codes.slotsMap.pf ).to.be.ok()
      expect( codes.slotsMap.f  ).to.be.ok()

    });



  });


  describe( "inputs with same Param ", function(){

    var inputA, inputB;

    beforeEach( function(){
      inputA = new Input( '_inputA', 1 )
      inputB = new Input( '_inputB', 1 )
      inputs.add( inputA );
      inputs.add( inputB );
    });


    it( 'dont duplicate param code', function(){
      const sampler = new Sampler('ttex', 'tc')
      inputA.attach( sampler, 'r' );
      inputB.attach( sampler, 'g' );

      var codes = inputs.getCode();
      var pf = codes.slotsMap.pf.code
      var decl = 'uniform sampler2D'
      
      var first = pf.indexOf(decl);
      var last  = pf.lastIndexOf(decl);
      var result = first === last && first != -1;
      expect( result ).to.be.equal( true )
    });

  })

});
