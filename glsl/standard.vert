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


// uniform mat4 uMVP;
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


struct VertexData {
  highp vec3 position;
  highp vec3 worldPos;
  #if hasNormals
    vec3 normal;
  #endif
  #if hasTangents
    vec3 tangent;
  #endif
  mat4 worldMatrix;
};


void InitVertexData( out VertexData vertex ){

  vertex.position = aPosition;
  #if hasNormals
    vertex.normal = aNormal;
  #endif
  #if hasTangents
    vertex.tangent = aTangent.xyz;
  #endif

  vertex.worldMatrix = uWorldMatrix;
   
}


void main( void ){

  #pragma SLOT v

  VertexData vertex;
  InitVertexData( vertex );

  #pragma SLOT vertex_warp

  vec4 worldPos = vertex.worldMatrix * vec4( vertex.position, 1.0 );
  vertex.worldPos.xyz = worldPos.xyz / worldPos.w;

  #pragma SLOT vertex_warp_world

  gl_Position     = uVP * vec4( vertex.worldPos, 1.0 );
  vWorldPosition  = vertex.worldPos;
  
  #if hasNormals
  vWorldNormal    = normalize( rotate( vertex.worldMatrix, vertex.normal ) );
  #endif

  #if HAS_normal && hasTangents
    vWorldTangent   = normalize( rotate( vertex.worldMatrix, vertex.tangent.xyz ) );
    vWorldBitangent = normalize( cross( vWorldNormal, vWorldTangent ) * aTangent.w );
  #endif

  #if perVertexIrrad
    vIrradiance = SampleSH( vWorldNormal, uSHCoeffs );
  #endif

  // vDebugColor = vec4( -position, 1.0 );
}