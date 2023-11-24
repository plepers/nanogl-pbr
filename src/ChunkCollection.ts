import Chunk from './Chunk'
import ChunksSlots from './ChunksSlots'
import Program from 'nanogl/program';


/**
 * This class manages a collection of chunks.
 */
export default class ChunkCollection {

  // _dirtyFlags : DirtyFlag = DirtyFlag.All;
  /** Whether the list of chunks is invalid or not */
  private _invalidList : boolean = true;
  /** Whether the code is invalid or not */
  private _invalidCode : boolean = true;
  /** The revision number for this collection */
  private _revision : number = 0;

  /** The list of all chunks and their children
   * in this collection
   */
  _all     : Set<Chunk> = new Set();
  /**
   * The list of all chunks and their children in this collection,
   * without the proxies
   */
  _actives : Set<Chunk> = new Set();
  /** The list of all chunks in this collection */
  _chunks  : Chunk[] = [];
  /** The list of all chunks that need program setup */
  _setups  : Chunk[] = [];
  /** The list of all chunks that need shader code generation */
  _codes   : Chunk[] = [];

  /**
   * The cached chunks slots for this collection.
   * This is used to avoid generating the code multiple times
   * when it is not invalid.
   */
  _cachedSlots : ChunksSlots|null = null;


  /**
   * Add a chunk to this collection.
   * @typeParam T The type of the chunk we are adding
   * @param chunk The chunk to add
   */
  add<T extends Chunk>( chunk : T ) : T {
    if( this._chunks.indexOf( chunk ) === -1 ){
      this._chunks.push( chunk );
      this.invalidateList();
    }
    return chunk;
  }

  /**
   * Remove a chunk from this collection.
   * @param {Chunk} chunk The chunk to remove
   */
  remove( chunk : Chunk ){
    const i = this._chunks.indexOf( chunk )
    if( i > -1 ) {
      this._chunks.splice( i, 1 );
      this.invalidateList();
    }
  }

  /**
   * Dispose of this collection.
   */
  dispose(){
    for( const chunk of this._all ){
      chunk.removeList( this );
    }
  }

  /**
   * Add multiple chunks to this collection.
   * @param {Chunk[]} chunks The chunks to add
   */
  addChunks( chunks : Chunk[] ){
    for ( const c of chunks ) {
      this.add( c );
    }
  }


  // updateChunks(){
  //   if( ( this._dirtyFlags & DirtyFlag.Hierarchy ) !== 0 ){
  //     this._collectChunks();
  //   }
  // }

  /**
   * Invalidate the list of chunks.
   */
  invalidateList(){
    this._invalidList = true;
    this.invalidateCode();
  }

  /**
   * Invalidate the list of code.
   */
  invalidateCode(){
    if( !this._invalidCode ){
      this._invalidCode = true;
      this._revision++;
    }
  }

  /**
   * Know whether this collection is invalid or not.
   */
  isInvalid(){
    return this._invalidList || this._invalidCode;
  }

  /**
   * Get the current revision for this collection.
   */
  getRevision(){
    return this._revision;
  }

  /**
   * Collect all chunks in this collection and setup the
   * lists of chunks accordingly.
   *
   * This sets the following lists with the current the chunks and their children :
   * - {@link ChunkCollection._all}
   * - {@link ChunkCollection._actives}
   * - {@link ChunkCollection._setups}
   * - {@link ChunkCollection._codes}
   */
  _collectChunks(){
    const all     = this._all,
          setups  = this._setups,
          codes   = this._codes,
          actives = this._actives;


    for( const chunk of all ){
      chunk.removeList( this );
    }

    all     .clear();
    actives .clear();

    setups  .length = 0;
    codes   .length = 0;


    for (const chunk of this._chunks ) {
      chunk.collectChunks( all, actives );
    }

    for( const chunk of actives ){
      chunk.hasSetup && setups.push( chunk );
      chunk.hasCode  && codes .push( chunk );
    }

    for( const chunk of all ){
      chunk.addList( this );
    }

    this._invalidList = false;

  }

  /**
   * Setup the given program for the chunks that need it.
   * @param prg The program to setup
   */
  setupProgram( prg : Program ){
    for ( const chunk of this._setups) {
      chunk.setup( prg );
    }
  }

  /**
   * Get the shader code for this collection.
   * @param {ChunksSlots} [base] The base slots to merge the code into
   */
  getCode( base? : ChunksSlots ) : ChunksSlots {

    if( this._invalidList ){
      this._collectChunks();
    }

    if( this._cachedSlots === null || this._invalidCode )  {

      const slots = new ChunksSlots();

      for ( const chunk of this._codes ){
        chunk.genCode( slots );
      }

      this._cachedSlots = slots;
      this._invalidCode = false;

    }

    if( base !== undefined ){
      base.merge( this._cachedSlots );
      return base;
    }

    return this._cachedSlots;
  }


}
