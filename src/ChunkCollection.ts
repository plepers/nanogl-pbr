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
  
  readonly baseHash: string;

  _dirtyFlags : DirtyFlag = DirtyFlag.All;

  _chunks  : Chunk[] = [];
  _all     : Chunk[] = [];
  _actives : Chunk[] = [];
  _setups  : Chunk[] = [];
  _codes   : Chunk[] = [];

  _cachedSlots : ChunkSlots|null = null;

  constructor( baseHash : string ){
    this.baseHash = baseHash;
  }


  add<T extends Chunk>( chunk : T ) : T {
    if( this._chunks.indexOf( chunk ) === -1 ){
      this._chunks.push( chunk );
      this.invalidate( DirtyFlag.Hierarchy );
    }
    return chunk;
  }
  
  
  remove( chunk : Chunk ){
    const i = this._chunks.indexOf( chunk )
    if( i > -1 ) {
      this._chunks.splice( i, 1 );
      this.invalidate( DirtyFlag.Hierarchy );
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


  invalidate( flag : DirtyFlag ){
    this._dirtyFlags |= flag;
  }

  isInvalid(){
    return this._dirtyFlags !== 0;
  }


  _collectChunks(){
    const all     = this._all,
          setups  = this._setups,
          codes   = this._codes,
          actives = this._actives;


    // TODO unregister all : remove from lists
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

    this._dirtyFlags &= ~DirtyFlag.Hierarchy;
    this._dirtyFlags |= DirtyFlag.Code;

  }


  setupProgram( prg : Program ){
    for ( const chunk of this._setups) {
      chunk.setup( prg );
    }
  }


//   getHash(){
//     let res    = '';

//     for ( const chunk of this._actives ){
//       if( chunk.hasCode )
//         res += chunk.getHash();
//     }

//     return res;
//   }


  getCode() : ChunkSlots {

    if( ( this._dirtyFlags & DirtyFlag.Hierarchy ) !== 0 ){
      this._collectChunks();
    }

    if( this._cachedSlots === null || ( this._dirtyFlags & DirtyFlag.Code ) !== 0 )  {

      const slots = new ChunkSlots();
      slots.hash = this.baseHash;

      for ( const chunk of this._codes ){
        chunk.genCode( slots );
        slots.hash += chunk.getHash();
      }

      this._cachedSlots = slots;

      this._dirtyFlags &= ~DirtyFlag.Code;
  
    }
    return this._cachedSlots;
  }


}
