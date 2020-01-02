import Chunk from './Chunk'
import ChunkSlots from './ChunksSlots'
import Program from 'nanogl/program';


export const enum DirtyFlag {
  None      = 0,
  Code      = 1,
  Hierarchy = 2,
  All       = Hierarchy|Code,
}


export default class ChunkCollection {
  
  // _dirtyFlags : DirtyFlag = DirtyFlag.All;
  private _invalidList : boolean = true;
  private _invalidCode : boolean = true;
  private _revision : number = 0;
  
  _chunks  : Chunk[] = [];
  _all     : Chunk[] = [];
  _actives : Chunk[] = [];
  _setups  : Chunk[] = [];
  _codes   : Chunk[] = [];
  
  _cachedSlots : ChunkSlots|null = null;
  
  

  add<T extends Chunk>( chunk : T ) : T {
    if( this._chunks.indexOf( chunk ) === -1 ){
      this._chunks.push( chunk );
      this.invalidateList();
    }
    return chunk;
  }
  
  
  remove( chunk : Chunk ){
    const i = this._chunks.indexOf( chunk )
    if( i > -1 ) {
      this._chunks.splice( i, 1 );
      this.invalidateList();
    }
  }


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


  invalidateList(){
    this._invalidList = true;
    this.invalidateCode();
  }

  invalidateCode(){
    if( !this._invalidCode ){
      this._invalidCode = true;
      this._revision++;
    }
  }

  isInvalid(){
    return this._invalidList || this._invalidCode;
  }

  getRevision(){
    return this._revision;
  }


  _collectChunks(){
    const all     = this._all,
          setups  = this._setups,
          codes   = this._codes,
          actives = this._actives;


    for( const chunk of all ){
      chunk.removeList( this );
    }

    all     .length = 0;
    setups  .length = 0;
    codes   .length = 0;
    actives .length = 0;


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


  setupProgram( prg : Program ){
    for ( const chunk of this._setups) {
      chunk.setup( prg );
    }
  }


  getCode( base? : ChunkSlots ) : ChunkSlots {

    if( this._invalidList ){
      this._collectChunks();
    }

    if( this._cachedSlots === null || this._invalidCode )  {

      const slots = new ChunkSlots();

      for ( const chunk of this._codes ){
        chunk.genCode( slots );
        slots.hash += chunk.getHash();
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
