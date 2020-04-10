

export function containStringOnce( occ, str ){
  var first = str.indexOf(occ);
  var last = str.lastIndexOf(occ);
  if( first === -1 ) throw `${occ} not found`
  if( first !== last ) throw `${occ} found more than once`
}

export function containStringsOnce( occs, str ){
  for( var occ of occs ){
    containStringOnce( occ, str );
  }
}