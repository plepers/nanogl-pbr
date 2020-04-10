

#ifndef _H_SPECULAR_IBL_
#define _H_SPECULAR_IBL_

{{ require( "../../includes/octwrap-decode.glsl" )() }}
{{ require( "../../includes/decode-rgbe.glsl" )() }}



// IBL
// ========
uniform sampler2D tEnv;



#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec4 uSHCoeffs[7];
  {{ require( "../../includes/spherical-harmonics.glsl" )() }}
#endif



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



vec3 ComputeIBLDiffuse( vec3 worldNormal ){
  #if perVertexIrrad
    return vIrradiance;
  #else
    return SampleSH(worldNormal, uSHCoeffs );
  #endif
}

#endif