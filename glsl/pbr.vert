#pragma SLOT pv


#if __VERSION__ == 300
  #define IN in
  #define OUT out
#else
  #define IN attribute
  #define OUT varying
#endif


IN vec3 aPosition;
IN vec2 aTexCoord;
IN vec3 aNormal;
IN vec3 aTangent;
IN vec3 aBitangent;

uniform mat4 uMVP;
uniform mat4 uWorldMatrix;

OUT vec2 vTexCoord;
OUT vec3 vWorldPosition;

OUT mediump vec3 vWorldNormal;

#if HAS_normal
  OUT mediump vec3 vWorldTangent;
  OUT mediump vec3 vWorldBitangent;
#endif

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

  vec4 pos = vec4( aPosition, 1.0 );

  gl_Position    = uMVP         * pos;
  vWorldPosition = (uWorldMatrix * pos).xyz;


  vWorldNormal    = rotate( uWorldMatrix, aNormal );
  #if HAS_normal
    vWorldTangent   = rotate( uWorldMatrix, aTangent );
    vWorldBitangent = rotate( uWorldMatrix, aBitangent );
  #endif

  #if perVertexIrrad
    vIrradiance = SampleSH( normalize( vWorldNormal ), uSHCoeffs );
    #if HAS_iblExpo
      vIrradiance = iblExpo().x * pow( vIrradiance, vec3( iblExpo().y ) );
    #endif
  #endif


  vTexCoord = aTexCoord;
}