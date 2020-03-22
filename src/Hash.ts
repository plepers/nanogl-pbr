
export type Hash = number



function _prehash(val: number): number {
  val = (val ^ 0x47cb8a8c) ^ (val << 12);
  val = (val ^ 0x61a988bc) ^ (val >> 19);
  val = (val ^ 0x78d2a3c8) ^ (val << 5);
  val = (val ^ 0x5972b1be) ^ (val << 9);
  val = (val ^ 0x2ea72dfe) ^ (val << 3);
  val = (val ^ 0x5ff1057d) ^ (val >> 16);
  return val;
}

function _hash(prev: number, val: number): number {
  val = _prehash(val)
  let shift0 = (val>>0 ) & 15;
  let shift1 = (val>>4 ) & 15;
  let shift2 = (val>>8 ) & 15;
  let shift3 = (val>>12) & 15;
  
  prev = ( (val ^((prev^0x47cb8a8c) << shift0 ) ^ (val ^((prev^0x78d2a3c8) >> (31-shift0) ))) );
  prev = ( (val ^((prev^0x61a988bc) << shift1 ) ^ (val ^((prev^0x5972b1be) >> (31-shift1) ))) );
  prev = ( (val ^((prev^0x78d2a3c8) << shift2 ) ^ (val ^((prev^0x2ea72dfe) >> (31-shift2) ))) );
  prev = ( (val ^((prev^0x5972b1be) << shift3 ) ^ (val ^((prev^0x5ff1057d) >> (31-shift3) ))) );
  
  return prev;
}

// function _hash( prev:number, val:number ) : number {
//   return ((prev << 5) - prev) + val;
// }
                                                             
                                                                      
let getCharCodes : (str:string)=>Uint16Array;


const buffer = new ArrayBuffer(1024 * 16)
const u8Buffer = new Uint8Array( buffer );
const u16Buffer = new Uint16Array( buffer );

if( window.TextEncoder !== undefined ){

  const encoder = new TextEncoder()

  getCharCodes = ( str : string ) : Uint16Array => {
    
    const u8 = encoder.encode(str);
    if( u8.byteLength > buffer.byteLength ){
      throw new Error("string is too big")
    }

    // odd number of bytes
    // erase remaining byte to avoid non deterministic result
    let evenLength = u8.byteLength;
    if( (evenLength & 1) !== 0){
      evenLength = evenLength+1;
      u8Buffer[u8.byteLength] = 0
    }
    
    u8Buffer.set( u8 );
    return new Uint16Array( buffer, 0, evenLength/2)
  }

} else {

  getCharCodes = ( str : string ) : Uint16Array => {
    
    const slen = str.length;
    for (let i = 0; i < slen; i++) {
      u16Buffer[i] = str.charCodeAt(i);
    }

    return new Uint16Array( buffer, 0, slen);
  }

}



/**
 * strings 
 */

export function hashString(str: string, hash : Hash = 0): Hash {
  const u16 = getCharCodes( str );
  for (let i = 0; i < u16.length; i++) {
    hash = _hash( hash, 0|u16[i] );
  }
  return hash;
}



/**
 * numbers 
 */


const hn_buff = new ArrayBuffer(8) 
const hn_f64 = new Float64Array(hn_buff)
const hn_u32 = new Uint32Array(hn_buff)

export function hashNumber( n : number, hash : Hash = 0 ) : Hash {
  hn_f64[0] = n;
  hash = _hash( hash, 0|hn_u32[0] );
  hash = _hash( hash, 0|hn_u32[1] );
  return hash;
}



export function mergeHash(h1 : Hash, h2 : Hash) : number {
  return hashNumber( h1, h2 );
}


/**
 * ArrayBufferView 
 */

export function hashView( a : ArrayBufferView, hash : Hash = 0 ) : Hash {
  let evenLength = a.byteLength;
  let isOdd = (a.byteLength & 1) !== 0 ;
  if( isOdd ){
    evenLength = a.byteLength - 1;
  }
  const u16 = new Uint16Array( a.buffer, a.byteOffset, evenLength/2 );
  for (let i = 0; i < u16.length; i++) {
    hash = _hash( hash, 0|u16[i]);
  }

  if( isOdd ){
    const lastShort = new Uint8Array( a.buffer, a.byteOffset + a.byteLength - 1, 1)[0];
    hash = _hash( hash, 0|(lastShort<<8));
  }

  return hash;
}


export function stringifyHash( h:Hash ) : string {
  let res =  h.toString(16)
  if( res[0] === '-' ) 
    res = res.replace('-', 'z')
  return res;
}


export class HashBuilder {
  
  private _hash : Hash = 0;

  start() : this {
    this._hash = 0;
    return this;
  }

  hashString( str: string ) : this {
    this._hash = hashString( str, this._hash );
    return this;
  }

  hashNumber( n : number ) : this {
    this._hash = hashNumber( n, this._hash );
    return this;
  }

  hashView( a : ArrayBufferView ) : this {
    this._hash = hashView( a, this._hash );
    return this;
  }
  
  get() : Hash{
    const h = this._hash;
    this._hash = 0;
    return h;
  }

}

const hashBuilder = new HashBuilder();

export default hashBuilder;