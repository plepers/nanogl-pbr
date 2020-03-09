//@ts-check

var expect = require('expect.js');
var sinon = require('sinon');


import ChunkCollection, { DirtyFlag } from '../ChunkCollection'
import { CodeChunk } from './utils/TestChunks'


describe("Chunk", function () {

  let collection = new ChunkCollection()

  beforeEach(function () {
    collection = new ChunkCollection()
  });

  describe("code gen", function () {

    var chunk;

    beforeEach(function () {
      chunk = new CodeChunk('A')
    });


    it('collection hash should be ok', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.hash).to.be('-A-');
    });


    it('collection num slots should be 1', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.slots.length).to.be(1);
    });

    it('collection code should be ok', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.slots[0].code).to.be('A\n');
    });

    it('collection code should be ok after change', function () {
      collection.add(chunk);
      var code;

      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');

      chunk.setCode('B');

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\n');
    });


  });



  describe("children", function () {

    var chunkA;
    var chunkB;

    beforeEach(function () {
      chunkA = new CodeChunk('A')
      chunkB = new CodeChunk('B')
      chunkA.addChild( chunkB );
    });


    it('collection hash should be ok', function () {
      collection.add(chunkA);
      var code = collection.getCode();

      expect(code.hash).to.be('-B--A-');
    });


    it('collection num slots should be 1', function () {
      collection.add(chunkA);
      var code = collection.getCode();

      expect(code.slots.length).to.be(1);
    });

    it('collection code should be ok', function () {
      collection.add(chunkA);
      var code = collection.getCode();

      expect(code.slots[0].code).to.be('B\nA\n');
    });

    it('collection code should be ok after change', function () {
      collection.add(chunkA);
      var code;

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\nA\n');

      chunkA.setCode('C');

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\nC\n');


      chunkB.setCode('D');

      code = collection.getCode();
      expect(code.slots[0].code).to.be('D\nC\n');
    });


    it('should throw if cyclic dependency', function () {


      const A = new CodeChunk('A')
      collection.add(A);

      const B = new CodeChunk('B')
      const C = new CodeChunk('C')

      B.addChild(C)
      C.addChild(A);

      let isOk = false

      try {
        A.addChild(B);
        collection.getCode();
      } catch (e) {
        if (e.name === 'RangeError') throw e;
        isOk = e.message.indexOf('cyclic dependency detected') > -1
      }

      expect(isOk).to.be(true);

    });


  });


  describe("proxy", function () {

    var chunk, proxy;

    beforeEach(function () {
      chunk = new CodeChunk('A')
      proxy = new CodeChunk('B')
      chunk.proxy(proxy);
    });



    it('collection hash should be ok', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.hash).to.be('-B-');
    });


    it('collection num slots should be 1', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.slots.length).to.be(1);
    });

    it('collection code should be ok', function () {
      collection.add(chunk);
      var code = collection.getCode();

      expect(code.slots[0].code).to.be('B\n');
    });

    it('collection code should be ok after change', function () {
      collection.add(chunk);
      var code;

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\n');

      chunk.setCode('C');

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\n');
    });


    it('removing proxy should be ok', function () {
      collection.add(chunk);
      var code;

      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\n');

      chunk.proxy(null);

      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');
    });

    it('removing proxy should be ok', function () {
      collection.add(chunk);
      var code;

      chunk.proxy(null);

      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');
    });


    it('removing proxy should invalidate', function () {
      collection.add(chunk);
      var code;
      code = collection.getCode();

      chunk.proxy(null);

      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');
    });


    it('should throw if cyclic dependency', function () {


      const A = new CodeChunk('A')
      collection.add(A);

      const B = new CodeChunk('B')
      const C = new CodeChunk('C')

      B.proxy(C)
      C.proxy(A);

      let isOk = false

      try {
        A.proxy(B);
        collection.getCode();

      } catch (e) {
        if (e.name === 'RangeError') throw e;
        isOk = e.message.indexOf('cyclic dependency detected') > -1
      }

      expect(isOk).to.be(true);

    });


  });




  describe("nested proxies", function () {

    var chunk, p1, p2, p3;

    beforeEach(function () {
      chunk = new CodeChunk('A')
      p1 = new CodeChunk('B')
      p2 = new CodeChunk('C')
      p3 = new CodeChunk('D')

    });



    it('proxiiing with proxied', function () {
      collection.add(chunk);
      p1.proxy(p2);
      p2.proxy(p3);
      var code;
      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');

      chunk.proxy(p1)
      code = collection.getCode();
      expect(code.slots[0].code).to.be('D\n');

    });

    it('remove all chain', function () {
      collection.add(chunk);
      chunk.proxy(p1)
      p1.proxy(p2);
      p2.proxy(p3);
      var code;
      code = collection.getCode();
      expect(code.slots[0].code).to.be('D\n');

      chunk.proxy(null)
      code = collection.getCode();
      expect(code.slots[0].code).to.be('A\n');

    });

    it('remove in chain', function () {
      collection.add(chunk);
      chunk.proxy(p1)
      p1.proxy(p2);
      p2.proxy(p3);
      var code;
      code = collection.getCode();
      expect(code.slots[0].code).to.be('D\n');

      p1.proxy(null)
      code = collection.getCode();
      expect(code.slots[0].code).to.be('B\n');

    });


    it('remove in chain 2', function () {
      collection.add(chunk);
      chunk.proxy(p1)
      p1.proxy(p2);
      p2.proxy(p3);
      var code;
      code = collection.getCode();
      expect(code.slots[0].code).to.be('D\n');

      p2.proxy(null)
      code = collection.getCode();
      expect(code.slots[0].code).to.be('C\n');

    });


  });





  describe("invalidation", function () {

    var chunk, proxy;

    beforeEach(function () {
      chunk = new CodeChunk('A')
      proxy = new CodeChunk('B')
      // chunk.proxy( proxy );
    });



    it('hierarchy should be invalid after adding chunk', function () {
      collection.add(chunk);
      collection.getCode();
      collection.add(new CodeChunk('X'));
      //@ts-ignore
      expect(collection._invalidList).to.be(true);
    });


    it('hierarchy should be invalid after removing chunk', function () {
      collection.add(chunk);
      collection.add(new CodeChunk('X'));
      collection.getCode();
      collection.remove(chunk);

      //@ts-ignore
      expect(collection._invalidList).to.be(true);
    });


    it('hierarchy should be invalid after proxiing chunk', function () {
      collection.add(chunk);
      collection.getCode();
      chunk.proxy(proxy);

      //@ts-ignore
      expect(collection._invalidList).to.be(true);
    });


    it('code should be invalid after update chunk', function () {
      collection.add(chunk);
      collection.getCode();
      chunk.setCode('B');

      //@ts-ignore
      expect(collection._invalidList).to.be(false);
      //@ts-ignore
      expect(collection._invalidCode).to.be(true);
    });


    it('dirty flags should be 0 after getCode', function () {
      collection.add(chunk);
      collection.getCode();

      //@ts-ignore
      expect(collection._invalidList).to.be(false);
      //@ts-ignore
      expect(collection._invalidCode).to.be(false);
    });

    it('dirty flags should be 0 when proxied chunk code change', function () {
      collection.add(chunk);
      chunk.proxy(proxy)
      collection.getCode();

      chunk.setCode('ABC')
      //TODO: make this test pass
      // expect( collection._dirtyFlags ).to.be( 0 );
    });


    it('getCode twice should return the same object', function () {
      collection.add(chunk);
      var code1 = collection.getCode();
      var code2 = collection.getCode();

      expect(code1 === code2).to.be(true);
    });


    it('getCode twice should return the same object', function () {

      var collect_spy = sinon.spy(collection, "_collectChunks");
      collection.add(chunk);
      collection.getCode();
      collection.getCode();

      expect(collect_spy.calledOnce).to.be(true);
    });


    it('code invalidation should not recollect', function () {

      var collect_spy = sinon.spy(collection, "_collectChunks");
      collection.add(chunk);
      collection.getCode();
      chunk.setCode('B');
      collection.getCode();

      expect(collect_spy.calledOnce).to.be(true);
    });



  });


  describe("shared chunks", function () {

    var chunk, proxy, collection2;

    beforeEach(function () {
      chunk = new CodeChunk('A')
      proxy = new CodeChunk('C')
      collection2 = new ChunkCollection()
      // chunk.proxy( proxy );
    });



    it('collections hash should be ok', function () {
      collection.add(chunk);
      collection2.add(chunk);
      var code1 = collection.getCode();
      var code2 = collection2.getCode();

      expect(code1.hash).to.be('-A-');
      expect(code2.hash).to.be('-A-');
    });


    it('collections num slots should be 1', function () {
      collection.add(chunk);
      collection2.add(chunk);
      var code1 = collection.getCode();
      var code2 = collection2.getCode();

      expect(code1.slots.length).to.be(1);
      expect(code2.slots.length).to.be(1);
    });


    it('collections code should be ok', function () {
      collection.add(chunk);
      collection2.add(chunk);
      var code1 = collection.getCode();
      var code2 = collection2.getCode();


      expect(code1.slots[0].code).to.be('A\n');
      expect(code2.slots[0].code).to.be('A\n');
    });


    it('collection code should be ok after change', function () {

      collection.add(chunk);
      collection2.add(chunk);

      collection.getCode();
      collection2.getCode();

      chunk.setCode('B');

      var code1 = collection.getCode();
      var code2 = collection2.getCode();

      expect(code1.slots[0].code).to.be('B\n');
      expect(code2.slots[0].code).to.be('B\n');
    });


    it('shared proxy should be ok', function () {

      var c1 = new CodeChunk('A')
      var c2 = new CodeChunk('B')

      collection.add(c1);
      collection2.add(c2);

      var code1 = collection.getCode();
      var code2 = collection2.getCode();

      expect(code1.slots[0].code).to.be('A\n');
      expect(code2.slots[0].code).to.be('B\n');

      c1.proxy(proxy)
      c2.proxy(proxy)

      code1 = collection.getCode();
      code2 = collection2.getCode();

      expect(code1.slots[0].code).to.be('C\n');
      expect(code2.slots[0].code).to.be('C\n');
    });



  });




});
