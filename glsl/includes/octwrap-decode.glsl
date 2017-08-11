
#ifndef _H_OCTWRAP_DECODE_
#define _H_OCTWRAP_DECODE_

vec2 octwrapDecode( vec3 v ) {
  // Project the sphere onto the octahedron, and then onto the xy plan
  vec2 p = v.xy / dot(  abs( v ) , vec3(1.0) );
  p = vec2( p.x+p.y-1.0, p.x-p.y );

  if( v.z < 0.0 )
    p.x *= -1.0;

  // p.x *= sign( v.z );
  return p;
}

#endif