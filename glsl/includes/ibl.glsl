
#ifndef _H_SPECULAR_IBL_
#define _H_SPECULAR_IBL_

{{ require( "./octwrap-decode.glsl" )() }}
{{ require( "./decode-rgbe.glsl" )() }}

const vec2 _IBL_UVM = vec2(
  0.25*(254.0/256.0),
  0.125*0.5*(254.0/256.0)
);

vec3 SpecularIBL( sampler2D tEnv, vec3 skyDir, float roughness)
{

  vec2 uvA = octwrapDecode( skyDir );

  float r7   = 7.0*roughness;
  float frac = fract(r7);

  uvA = uvA * _IBL_UVM + vec2(
      0.5,
      0.125*0.5 + 0.125 * ( r7 - frac )
    );

  #if glossNearest

    return decodeRGBE( texture2D(tEnv,uvA) );

  #else

    vec2 uvB=uvA+vec2(0.0,0.125);
    return  mix(
      decodeRGBE( texture2D(tEnv,uvA) ),
      decodeRGBE( texture2D(tEnv,uvB) ),
      frac
    );

  #endif

}

#endif