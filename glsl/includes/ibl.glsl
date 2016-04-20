

#pragma glslify: octwrapDecode = require( ./octwrap-decode.glsl )
#pragma glslify: decodeRGBE = require( ./decode-rgbe.glsl )

vec3 SpecularIBL( sampler2D tEnv, vec3 skyDir, float roughness)
{

  vec2 uvA = octwrapDecode( skyDir );

  uvA = vec2(
    0.25*(254.0/256.0),
    0.125*0.5*(254.0/256.0)
    ) * uvA + vec2(0.5,0.125*0.5);



  float frac=fract(7.0*roughness);
  uvA.y+=0.125*(7.0*roughness-frac);
  vec2 uvB=uvA+vec2(0.0,0.125);

  return  mix(
    decodeRGBE( texture2D(tEnv,uvA) ),
    decodeRGBE( texture2D(tEnv,uvB) ),
    frac
  );
  // return decodeRGBE( texture2D(tEnv,P) );

}

#pragma glslify: export(SpecularIBL)