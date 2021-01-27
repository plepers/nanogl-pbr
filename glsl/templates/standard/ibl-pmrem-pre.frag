#if __VERSION__ == 300

#ifndef _H_SPECULAR_IBL_PMREM_
#define _H_SPECULAR_IBL_PMREM_

{{ require( "../../includes/tonemap.glsl" )() }}

uniform samplerCube tEnv;

const float MaxRangeRGBD = 255.0; 

vec3 decodeRGBD(vec4 rgbd)
{
    float a = max(rgbd.a, 0.00);
    return rgbd.rgb * ((MaxRangeRGBD / 255.0) / a);
}


vec3 SpecularIBL( samplerCube tEnv, vec3 skyDir, float roughness)
{

  float r7   = 7.0*roughness;

  float mipA = floor(r7);
  float mipB = ceil(r7);
  float delta = r7 - mipA;

  #if glossNearest

    return decodeRGBD( textureLod(tEnv,skyDir, mipA) );

  #else

    vec3 color = mix(
      decodeRGBD( textureLod(tEnv, skyDir, mipA) ),
      decodeRGBD( textureLod(tEnv, skyDir, mipB) ),
      delta
    );

    return color;

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
#endif