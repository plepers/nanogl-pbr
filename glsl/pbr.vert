#pragma SLOT pv

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;

uniform mat4 uMVP;
uniform mat4 uWorldMatrix;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;

varying mediump vec3 vWorldNormal;

#if HAS_normal
  varying mediump vec3 vWorldTangent;
  varying mediump vec3 vWorldBitangent;
#endif

#if perVertexIrrad
  varying vec3 vIrradiance;
  uniform vec4 uSHCoeffs[7];
  #pragma glslify: SampleSH    = require( ./includes/spherical-harmonics.glsl )
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
    vIrradiance = SampleSH(vWorldNormal, uSHCoeffs );
    #if HAS_iblExpo
      vIrradiance = iblExpo().x * pow( vIrradiance, vec3( iblExpo().y ) );
    #endif
  #endif


  vTexCoord = aTexCoord;
}