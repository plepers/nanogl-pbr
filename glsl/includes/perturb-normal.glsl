

vec3 perturbWorldNormalDerivatives( vec3 nrm, vec3 n, vec2 texcoord ){
  // compute derivations of the world position
  n = 2.0 * n - 1.0;


  vec3 p_dx = dFdx(vWorldPosition);
  vec3 p_dy = dFdy(vWorldPosition);
  // compute derivations of the texture coordinate
  vec2 tc_dx = dFdx(texcoord);
  vec2 tc_dy = dFdy(texcoord);

  float r = 1.0 / (tc_dx.x * tc_dy.y - tc_dx.y * tc_dy.x);

  // compute initial tangent and bi-tangent
  vec3 t = normalize( tc_dy.y * p_dx - tc_dx.y * p_dy )*r;
  vec3 b = normalize( tc_dx.x * p_dy - tc_dy.x * p_dx )*r;

  // get new tangent from a given world normal
  vec3 x = cross(nrm, t);
  t = cross(x, nrm);
  t = normalize(t);
  // get updated bi-tangent
  x = cross(b, nrm);
  b = cross(nrm, x);
  b = normalize(b);
  mat3 tbn = mat3(t, b, nrm);
  return tbn * n;
}
  

vec3 perturbWorldNormal( vec3 nrm, vec3 n, vec3 wtan, vec3 wbitan ){
  n = 2.0*n - 1.0;
  return wtan * n.x + wbitan*n.y + nrm * n.z;
}

