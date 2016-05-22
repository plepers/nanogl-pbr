

#pragma glslify: octwrapDecode = require( ./octwrap-decode.glsl )
#pragma glslify: decodeRGBE = require( ./decode-rgbe.glsl )


const vec2 _IBL_UVM = vec2(
  0.25*(254.0/256.0),
  0.125*0.5*(254.0/256.0)
);

vec3 SpecularIBL( sampler2D tEnv, vec3 skyDir, float roughness)
{

  vec2 uvA = octwrapDecode( skyDir );

  float r7 = 7.0*roughness;
  uvA = uvA * _IBL_UVM + vec2(
      0.5,
      0.125*0.5 + 0.125 * ( r7 - fract( r7 ) )
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

  // return decodeRGBE( texture2D(tEnv,P) );

}

#pragma glslify: export(SpecularIBL)