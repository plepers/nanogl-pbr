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

  // _isDirty: boolean;
  _dirtyFlags : DirtyFlag = DirtyFlag.All;

  _chunks  : Chunk[];
  _all     : Chunk[];
  _actives : Chunk[];
  _setups  : Chunk[];


  constructor(){
    this._chunks  = [];
    this._all     = [];
    this._actives = [];
    this._setups  = [];
  }


  add<T extends Chunk>( chunk : T ) : T {
    if( this._chunks.indexOf( chunk ) === -1 ){
      this._chunks.push( chunk );
      this.invalidate( DirtyFlag.All );
    }
    return chunk;
  }
  
  
  remove( chunk : Chunk ){
    const i = this._chunks.indexOf( chunk )
    if( i > -1 ) {
      this._chunks.splice( i, 1 );
      this.invalidate( DirtyFlag.All );
    }
  }


  addChunks( chunks : Chunk[] ){
    for ( const c of chunks ) {
      this.add( c );
    }
  }


  compile(){
    if( ( this._dirtyFlags & DirtyFlag.Hierarchy ) !== 0 ){
      this._collectChunks();
    }
  }


  invalidate( flag : DirtyFlag ){
    this._dirtyFlags |= flag;
  }

  isInvalid(){
    return this._dirtyFlags !== 0;
  }


  _collectChunks(){
    const all     = this._all,
          setups  = this._setups,
          actives = this._actives;


    // TODO unregister all : remove from lists
    for( const chunk of all ){
      chunk.removeList( this );
    }

    actives .length = 0;
    all     .length = 0;


    for (const chunk of this._chunks ) {
      chunk.collectChunks( all, actives );
    }

    for( const chunk of actives ){
      chunk.hasSetup && setups.push( chunk );
    }

    for( const chunk of all ){
      chunk.addList( this );
    }

    this._dirtyFlags &= ~DirtyFlag.Hierarchy;

  }


  setupProgram( prg : Program ){
    for ( const chunk of this._setups) {
      chunk.setup( prg );
    }
  }


  getHash(){
    let res    = '';

    for ( const chunk of this._actives ){
      if( chunk.hasCode )
        res += chunk.getHash();
    }

    return res;
  }


  getCode(){

    const slots = new ChunkSlots();

    for ( const chunk of this._actives ){
      chunk.hasCode && chunk.genCode( slots );
    }

    return slots;
  }


}
