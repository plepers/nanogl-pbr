#pragma SLOT version

#pragma SLOT definitions

#ifndef hasNormals
  #define hasNormals 1
#endif 
#ifndef hasTangents
  #define hasTangents hasNormals
#endif 

#if hasTangents && !hasNormals 
  #pragma error tan but no nrm
  error
#endif

#pragma SLOT precision

{{ require( "./includes/glsl-compat.vert" )() }}

#pragma SLOT pv


IN vec3 aPosition;

#if hasNormals
IN vec3 aNormal;
OUT mediump vec3 vWorldNormal;
#endif

// has normal map and tangent attribute
#if hasTangents
IN vec4 aTangent;
#endif

#if HAS_normal && hasTangents
OUT mediump vec3 vWorldTangent;
OUT mediump vec3 vWorldBitangent;
#endif


uniform mat4 uMVP;
uniform mat4 uWorldMatrix;
uniform mat4 uVP;

OUT vec3 vWorldPosition;





#if perVertexIrrad
  OUT vec3 vIrradiance;
  uniform vec4 uSHCoeffs[7];
  {{ require( "./includes/spherical-harmonics.glsl" )() }}
#endif



vec3 rotate( mat4 m, vec3 v )
{
  return m[0].xyz*v.x + m[1].xyz*v.y + m[2].xyz*v.z;
}

void main( void ){

  #pragma SLOT v

  // warp acces
  highp vec3 position = aPosition;
   
  #if hasNormals
  vec3 normal = aNormal;
  #endif

  #if hasTangents
  vec3 tangent = aTangent.xyz;
  #endif
  
  mat4 worldMatrix = uWorldMatrix;
  mat4 mvp         = uMVP;


  #pragma SLOT vertex_warp

  vec4 worldPos = worldMatrix * vec4( position, 1.0 );
  worldPos.xyz /= worldPos.w;
  worldPos.w = 1.0;

  #pragma SLOT vertex_warp_world

  gl_Position     = uVP         * worldPos;

  vWorldPosition  = worldPos.xyz;
  
  #if hasNormals
  vWorldNormal    = normalize( rotate( worldMatrix, normal ) );
  #endif

  #if HAS_normal && hasTangents
    vWorldTangent   = normalize( rotate( worldMatrix, tangent.xyz ) );
    vWorldBitangent = normalize( cross( vWorldNormal, vWorldTangent ) * aTangent.w );
  #endif

  #if perVertexIrrad
    vIrradiance = SampleSH( vWorldNormal, uSHCoeffs );
  #endif

  // vDebugColor = vec4( -position, 1.0 );
}