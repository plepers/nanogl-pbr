//@ts-check

var expect = require('expect.js');
var sinon = require('sinon');
import Input from '../Input'


import ChunkCollection from '../ChunkCollection'


describe("Slots", function () {

  let collection = new ChunkCollection()

  beforeEach(function () {
    collection = new ChunkCollection()
  });

  describe("code gen", function () {
    /**
     * @type {Input}
     */
    var chunkA;
    var chunkB;

    beforeEach(function () {
      chunkA = new Input('inputA', 1);
      chunkB = new Input('inputA', 1);
    });


    // it('collection hash should be ok', function () {
    //   collection.add(chunk);
    //   var code = collection.getCode();

    //   expect(code.hash).to.be('-A-');
    // });


    it('collection num slots should be 1', function () {
      collection.add(chunkA);
      collection.add(chunkB);

      chunkA.attachConstant(2)
      chunkB.attachConstant(3)

      var code = collection.getCode();

      
      expect( code.slotsMap['pf'] ).to.be.ok()
      
      var pfcode = code.slotsMap['pf'].code;
      expect( pfcode ).to.be.ok()

      expect( pfcode.match(/inputA/g).length ).to.be.equal(2)

      // console.log( code.slotsMap['pf'].code )
      // console.log( pfcode.match(/inputA/g).length )
    });

    

  });





});
