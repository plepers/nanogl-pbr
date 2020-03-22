//@ts-check

var expect = require('expect.js');
import TexCoord, { StaticTexCoord } from '../TexCoord'


import ChunkCollection from '../ChunkCollection'
import { containStringsOnce, containStringOnce } from './utils';
import { mat3 } from 'gl-matrix';


describe("TexCoord", function () {

  let collection = new ChunkCollection()

  beforeEach(function () {
    collection = new ChunkCollection()
  });

  describe("code gen", function () {
    /** @type {StaticTexCoord}  */
    var tcA;
    var tcB;


    it('code should have 2 tc', function () {

      tcA = TexCoord.create('aTexCoord0');
      tcB = TexCoord.create('aTexCoord1');

      collection.add(tcA);
      collection.add(tcB);

      var code = collection.getCode();

      containStringsOnce( [
        'IN mediump vec2 aTexCoord0', 
        'IN mediump vec2 aTexCoord1'], 
        code.slotsMap['pv'].code )
      containStringsOnce( [
        '= aTexCoord0', 
        '= aTexCoord1'], 
        code.slotsMap['v'].code )
        
      expect( code.slotsMap['pv'].code.match( /OUT mediump vec2 vTexCoord_/g ).length ).to.be.equal( 2 );
      expect( code.slotsMap['pf'].code.match( /IN mediump vec2 vTexCoord_/g ).length ).to.be.equal( 2 );
    });


    it('2 same tc code should output 1 code', function () {

      tcA = TexCoord.create('aTexCoord0');
      tcB = TexCoord.create('aTexCoord0');

      collection.add(tcA);
      collection.add(tcB);

      var code = collection.getCode();

      containStringOnce( 
        'IN mediump vec2 aTexCoord0', 
        code.slotsMap['pv'].code )
      containStringOnce(
        '= aTexCoord0', 
        code.slotsMap['v'].code )
        
      expect( code.slotsMap['pf'].code.match( /IN mediump vec2 vTexCoord_/g ).length ).to.be.equal( 1 );
    });


    it('2 tc with diff xforms code should output 2 code', function () {
      const m3 = mat3.create()
      m3.set([1,0,0,0,1,0,1,0,0])
      tcA = TexCoord.create('aTexCoord0');
      tcB = TexCoord.createTransformed('aTexCoord0', m3);

      collection.add(tcA);
      collection.add(tcB);
      

      var code = collection.getCode();

      containStringOnce( 
        'IN mediump vec2 aTexCoord0', 
        code.slotsMap['pv'].code )
      
      expect( code.slotsMap['v'].code.match( /= aTexCoord0/g ).length ).to.be.equal( 2 );
      expect( code.slotsMap['pv'].code.match( /OUT mediump vec2 vTexCoord_/g ).length ).to.be.equal( 2 );
      expect( code.slotsMap['pf'].code.match( /IN mediump vec2 vTexCoord_/g ).length ).to.be.equal( 2 );
    });

  

    it('static tc code', function () {
      const m3 = mat3.create()
      m3.set([.5,0,0,0,1,0,1,0,0])
      tcB = TexCoord.createTransformed('aTexCoord0', m3);

      collection.add(tcB);

      var code = collection.getCode();

      containStringOnce( 
        'IN mediump vec2 aTexCoord0', 
        code.slotsMap['pv'].code )
      
      expect( code.slotsMap['v'].code.match( /\* aTexCoord0/g ).length ).to.be.equal( 1 );
      expect( code.slotsMap['pv'].code.match( /OUT mediump vec2 vTexCoord_/g ).length ).to.be.equal( 1 );
      expect( code.slotsMap['pf'].code.match( /IN mediump vec2 vTexCoord_/g ).length ).to.be.equal( 1 );
    });



    it('dynamic tc code', function () {
      tcB = TexCoord.createTransformedDynamic('aTexCoord0');

      collection.add(tcB);

      var code = collection.getCode();

      containStringOnce( 
        'IN mediump vec2 aTexCoord0', 
        code.slotsMap['pv'].code )

      expect( code.slotsMap['v'].code.match( /\* aTexCoord0/g ).length ).to.be.equal( 1 );
      expect( code.slotsMap['pv'].code.match( /OUT mediump vec2 vTexCoord_/g ).length ).to.be.equal( 1 );
      expect( code.slotsMap['pf'].code.match( /IN mediump vec2 vTexCoord_/g ).length ).to.be.equal( 1 );
    });

    

  });





});
