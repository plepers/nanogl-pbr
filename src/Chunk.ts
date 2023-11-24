import Program    from 'nanogl/program'
import ChunksTree from './ChunkCollection'
import ChunksSlots from './ChunksSlots'


/**
 * This class represents a chunk of glsl code
 * that can be included in a shader program.
 *
 * It is the base class for all chunks.
 */
export default abstract class Chunk {
  /** The list of all ChunkCollections this chunk is in */
  private   _lists: Set<ChunksTree>;

  /** Whether this chunk needs shader code generation or not */
  protected _hasCode : boolean;

  /** Whether this chunk needs program setup (for uniforms) or not */
  protected _hasSetup: boolean;

  /**
   * Whether the program setup is invalid or not.
   *
   * If the setup is invalid, the program needs to reupload uniforms.
   */
  protected _invalid : boolean;

  /** The reference to the chunk this is a proxy of */
  protected _ref: this | null;

  /** The list of children for this chunk */
  protected _children: Chunk[];

  /**
   * @param {boolean} [hasCode=false] Whether this chunk needs shader code generation or not
   * @param {boolean} [hasSetup=false]  Whether this chunk needs program setup (for uniforms) or not
   */
  constructor(hasCode: boolean = false, hasSetup: boolean = false) {

    this._ref = null;

    this._lists    = new Set();
    this._hasCode  = hasCode;
    this._hasSetup = hasSetup;
    this._invalid  = true;
    this._children = []

  }

  /**
   * Add this chunk and all its children to given arrays
   * @param {Set<Chunk>} all The array in which to add the chunks, including the proxies and their reference
   * @param {Set<Chunk>} actives The array in which to add the chunks, replacing the proxies by their reference
   */
  collectChunks( all : Set<Chunk>, actives : Set<Chunk> ){
    all.add( this );
    if( this._ref !== null ) {
      this._ref.collectChunks( all, actives );
    } else {
      for (const child of this._children ) {
        child.collectChunks( all, actives );
      }
      actives.add( this );
    }
  }

  /**
   * Detect cyclic dependency for the given chunk with this chunk.
   *
   * Cyclic dependency is checked when adding children or creating proxies.
   *
   * @param {Chunk} chunk The chunk to check for cyclic dependency
   */
  detectCyclicDependency( chunk : Chunk ) : boolean {
    const all     :Set<Chunk> = new Set();
    const actives :Set<Chunk> = new Set();
    chunk.collectChunks( all, actives );
    return all.has(this);
  }

  /**
   * Add a child to this chunk.
   *
   * @typeParam T The type of the chunk we are adding
   * @param chunk The chunk to add to children
   */
  addChild<T extends Chunk>( child : T ) : T {
    if (this._children.indexOf(child) > -1) {
      return child;
    }
    if( this.detectCyclicDependency( child ) ){
      throw new Error( `Chunk.addChild() will lead to cyclic dependency` );
    }
    this._children.push(child);
    this.invalidateList();
    return child;
  }

  /**
   * Remove a child from this chunk.
   *
   * @param {Chunk} chunk The chunk to remove from children
   */
  removeChild( child : Chunk ){
    var i = this._children.indexOf(child);
    if (i > -1) {
      this._children.splice(i, 1);
    }
    this.invalidateList();
  }


  /**
   * Generate the shader code for this chunk.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   */
  genCode(slots : ChunksSlots ):void{
    if( this._ref !== null ) {
      this._ref.genCode( slots );
    } else {
      this._genCode( slots );
    }
  }

  /**
   * Whether this chunk needs shader code generation or not.
   */
  get hasCode():boolean{
    if( this._ref !== null ) {
      return this._ref.hasCode;
    } else {
      return this._hasCode;
    }
  }

  /**
   * Whether this chunk needs program setup (for uniforms) or not.
   */
  get hasSetup():boolean{
    if( this._ref !== null ) {
      return this._ref.hasSetup;
    } else {
      return this._hasSetup;
    }
  }

  /**
   * Whether the program setup is invalid or not.
   */
  get isInvalid():boolean{
    if( this._ref !== null ) {
      return this._ref.isInvalid;
    } else {
      return this._invalid;
    }
  }

  /**
   * The method called by {@link Chunk#genCode}
   * to generate the shader code for this chunk.
   *
   * @param {ChunksSlots} slots The slots to add the code to
   */
  protected abstract _genCode( slots : ChunksSlots ):void;

  /**
   * Setup the given program for this chunk.
   * @param prg The program to setup
   */
  setup(prg : Program ) {
    // noop
  }

  /**
   * Add the given ChunkCollection to the list of collections this chunk is in.
   * @param list The ChunkCollection to add
   */
  addList(list: ChunksTree ) {
    this._lists.add( list );
  }

  /**
   * Remove the given ChunkCollection from the list of collections this chunk is in.
   * @param list The ChunkCollection to remove
   */
  removeList(list: ChunksTree ) {
    this._lists.delete( list );
  }

  /**
   * Invalidate the list of all ChunkCollections this chunk is in.
   */
  invalidateList() {
    for( const l of this._lists.values() ){
      l.invalidateList();
    }
  }

  /**
   * Invalidate the code of all ChunkCollections this chunk is in.
   */
  invalidateCode() {
    for( const l of this._lists.values() ){
      l.invalidateCode();
    }
  }

  /**
   * Make this chunk a proxy of the given chunk.
   * @param ref The chunk to proxy
   */
  proxy( ref : this|null = null ){
    if( this._ref === ref ) return;
    if( ref !== null && this.detectCyclicDependency( ref ) ){
      throw new Error( `Chunk.proxy() will lead to cyclic dependency` );
    }
    this._ref = ref;
    this.invalidateList();
  }

  /**
   * Create a proxy of this chunk.
   */
  createProxy() {
    const Class : new()=>Chunk = <any>Chunk;
    const p = new Class();
    p.proxy( this );
    return p;
  }


}
