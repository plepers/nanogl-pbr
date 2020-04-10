var expect  = require( 'expect.js' );


import Node       from 'nanogl-node' 
import DirLight   from '../lighting/DirectionalLight' 
import SpotLight   from '../lighting/SpotLight' 
import LightSetup from '../lighting/LightSetup' 
import ChunkList from '../ChunkCollection' 




describe( "LightSetup", function(){

  var setup;

  beforeEach( function(){
    setup = new LightSetup()
  });

  describe( "directionals", function(){

    var l1, l2, n;

    beforeEach( function(){
      n = new Node()
      l1 = new DirLight();
      l2 = new DirLight();
      n.add( l1 );
      n.add( l2 );
    });


    it( 'should add one', function(){
      setup.add( l1 );
    });


    it( 'should provide chunks', function(){
      setup.add( l1 );
      var chunks = setup.getChunks()
    });


    it( 'should provide chunks', function(){
      setup.add( l1 );
      var list = new ChunkList()
      var chunks = setup.getChunks()
      for (var i = 0; i < chunks.length; i++) {
        list.add( chunks[i] )
      }

      list.getCode()
    });


  });


  describe( "spots", function(){

    var l1, l2, n;

    beforeEach( function(){
      n = new Node()
      l1 = new SpotLight();
      l2 = new SpotLight();
      n.add( l1 );
      n.add( l2 );
    });


    it( 'should add one', function(){
      setup.add( l1 );
    });


    it( 'should provide chunks', function(){
      setup.add( l1 );
      var chunks = setup.getChunks()
    });


    it( 'should provide chunks', function(){
      setup.add( l1 );
      var list = new ChunkList()
      var chunks = setup.getChunks()
      for (var i = 0; i < chunks.length; i++) {
        list.add( chunks[i] )
      }

      list.getCode()
    });


  });

});
