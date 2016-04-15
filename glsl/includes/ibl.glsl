

#pragma glslify: octwrapDecode = require( ./octwrap-decode.glsl )
#pragma glslify: decodeRGBE = require( ./decode-rgbe.glsl )

vec3 SpecularIBL( sampler2D tEnv, vec3 skyUV, float roughness)
{

  vec2 P = octwrapDecode( skyUV );

  P = vec2(
    0.25*(254.0/256.0),
    0.125*0.5*(254.0/256.0)
    ) * P + vec2(0.5,0.125*0.5);



  float Q=fract(7.0*roughness);
  P.y+=0.125*(7.0*roughness-Q);
  vec2 R=P+vec2(0.0,0.125);

  return  mix(
    decodeRGBE( texture2D(tEnv,P) ),
    decodeRGBE( texture2D(tEnv,R) ),
    Q
  );
  // return decodeRGBE( texture2D(tEnv,P) );

}

#pragma glslify: export(SpecularIBL)