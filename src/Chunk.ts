import Program    from 'nanogl/program'
import ChunksTree, { DirtyFlag } from './ChunkCollection' 
import ChunkSlots from './ChunksSlots'



export default abstract class Chunk {

  private   _lists: Set<ChunksTree>;

  // is generate glsl code
  protected _hasCode : boolean;

  // is setup program (uniforms)
  protected _hasSetup: boolean;
  
  // setup is invalid (need reupload uniform)
  protected _invalid : boolean;
  
  // 
  protected _ref: this | null;

  protected _children: Chunk[];

  constructor(hasCode: boolean = false, hasSetup: boolean = false) {

    this._ref = null;

    this._lists    = new Set();
    this._hasCode  = hasCode;
    this._hasSetup = hasSetup;
    this._invalid  = true;
    this._children = []

  }

  /*
   * populate given array with this chunk and all it's descendant
   * all array 
   */
  collectChunks( all : Chunk[], actives : Chunk[] ){
    all.push( this );
    if( this._ref !== null ) {
      this._ref.collectChunks( all, actives );
    } else {
      for (const child of this._children ) {
        child.collectChunks( all, actives );
      }
      actives.push( this );
    }
  }


  addChild<T extends Chunk>( child : T ) : T {
    if (this._children.indexOf(child) > -1) {
      return child;
    }
    this._children.push(child);
    this.invalidateList();
    return child;
  }


  removeChild( child : Chunk ){
    var i = this._children.indexOf(child);
    if (i > -1) {
      this._children.splice(i, 1);
    }
    this.invalidateList();
  }



  genCode(slots : ChunkSlots ):void{
    if( this._ref !== null ) {
      this._ref.genCode( slots );
    } else {
      this._genCode( slots );
    }
  }

  getHash():string{
    if( this._ref !== null ) {
      return this._ref.getHash();
    } else {
      return this._getHash();
    }
  }

  get hasCode():boolean{
    if( this._ref !== null ) {
      return this._ref.hasCode;
    } else {
      return this._hasCode;
    }
  }

  get hasSetup():boolean{
    if( this._ref !== null ) {
      return this._ref.hasSetup;
    } else {
      return this._hasSetup;
    }
  }

  get isInvalid():boolean{
    if( this._ref !== null ) {
      return this._ref.isInvalid;
    } else {
      return this._invalid;
    }
  }

  protected abstract _genCode( slots : ChunkSlots ):void;
  protected abstract _getHash() : string;


  setup(prg : Program ) {
    // noop
  }


  addList(list: ChunksTree ) {
    this._lists.add( list );
  }

  removeList(list: ChunksTree ) {
    this._lists.delete( list );
  }

  invalidateList() {
    for( const l of this._lists.values() ){
      l.invalidateList();
    }
  }

  invalidateCode() {
    for( const l of this._lists.values() ){
      l.invalidateCode();
    }
  }


  proxy( ref : this|null = null ){
    if( this._ref === ref ) return;
    this._ref = ref;
    this.invalidateList();
  }


  createProxy() {
    const Class : new()=>Chunk = <any>Chunk;
    const p = new Class();
    p.proxy( this );
    return p;
  }


}
