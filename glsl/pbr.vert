#pragma PRECODE

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
varying mediump vec3 vWorldTangent;
varying mediump vec3 vWorldBitangent;


vec3 rotate( mat4 m, vec3 v )
{
  return m[0].xyz*v.x + m[1].xyz*v.y + m[2].xyz*v.z;
}

void main( void ){

  #pragma CODE
  
  vec4 pos = vec4( aPosition, 1.0 );

  gl_Position    = uMVP         * pos;
  vWorldPosition = (uWorldMatrix * pos).xyz;


  vWorldNormal    = rotate( uWorldMatrix, aNormal );
  vWorldTangent   = rotate( uWorldMatrix, aTangent );
  vWorldBitangent = rotate( uWorldMatrix, aBitangent );


  vTexCoord = aTexCoord;
}