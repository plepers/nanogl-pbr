
vec2 octwrapDecode(in vec3 v) {
  // Project the sphere onto the octahedron, and then onto the xy plane
  vec2 p = v.xz / ( abs(v.x) + abs(v.y) + abs(v.z) );
  p = vec2( p.x+p.y-1.0, p.x-p.y );
  p.x *= sign( v.y );
  return p;
}

#pragma glslify: export(octwrapDecode)