import Program    from 'nanogl/program'

import ChunksTree from './chunks-tree' 
import ChunkSlots from './chunks-slots'


abstract class Chunk {

  children: Chunk[];
  parent: Chunk | null;
  list: ChunksTree | null;

  _hasCode: boolean;
  _hasSetup: boolean;
  _invalid: boolean;
  
  _proxies: ChunkProxy[];

  constructor(hasCode: boolean = false, hasSetup: boolean = false) {

    this.list = null;
    
    this.children = [];
    this.parent = null;

    // is generate glsl code
    this._hasCode = hasCode;

    // is setup program (uniforms)
    this._hasSetup = hasSetup;

    // setup is invalid (need reupload uniform)
    this._invalid = true;

    // optional proxies
    this._proxies = [];



  }




  abstract genCode(slots : ChunkSlots ):void;


  abstract getHash() : string;


  setup(prg : Program ) {
    // noop
  }


  add<T extends Chunk>( child : T ) : T {
    if (this.children.indexOf(child) > -1) {
      return child;
    }
    this.children.push(child);
    child.setList(this.list);
    child.parent = this;
    for (var i = 0; i < this._proxies.length; i++) {
      this._proxies[i].add(child.createProxy());
    }

    this.invalidate();
    return child;
  }


  remove(child : Chunk) {
    var i = this.children.indexOf(child);
    if (i > -1) {
      this.children.splice(i, 1);
      child.parent = null;
      child.removeProxies();
    }
    this.invalidate();
  }


  setList(list: ChunksTree | null ) {
    this.list = list;
    this.invalidate();

    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setList(list);
    }

  }


  traverse(setups : Chunk[], codes : Chunk[], chunks : Chunk[]) {

    if (chunks.indexOf(this) === -1) {

      for (var i = 0; i < this.children.length; i++) {
        this.children[i].traverse(setups, codes, chunks);
      }

      if (this._hasSetup) {
        setups.push(this);
      }

      if (this._hasCode) {
        codes.push(this);
      }

      chunks.push(this);
    }

  }


  invalidate() {
    if (this.list) {
      this.list._isDirty = true;
    }
    for (var i = 0; i < this._proxies.length; i++) {
      this._proxies[i].invalidate();
    }
  }


  createProxy() {
    var p = new ChunkProxy(this);
    for (var i = 0; i < this.children.length; i++) {
      p.add(this.children[i].createProxy());
    }
    this._proxies.push(p);
    return p;
  }


  releaseProxy(p:ChunkProxy) {
    var i = this._proxies.indexOf(p);
    if (i > -1) {
      this._proxies.splice(i, 1);
    }
  }


  removeProxies() {

    for (var i = 0; i < this._proxies.length; i++) {
      var p = this._proxies[i];
      if (p.parent !== null) {
        p.parent.remove(p);
      }
    }
  }


}



export class ChunkProxy<TChunk extends Chunk = Chunk> extends Chunk {

  _ref: TChunk;

  constructor(ref: TChunk) {
    super(ref._hasCode, ref._hasSetup);
    this._ref = ref;
  }


  genCode(chunk: ChunkSlots): void { this._ref.genCode(chunk); }
  getHash() { return this._ref.getHash(); }
  setup(prg: Program) { this._ref.setup(prg); }

  release() {
    this._ref.releaseProxy(this);
  }

}



export default Chunk;