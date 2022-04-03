

#ifndef _H_SPECULAR_IBL_
#define _H_SPECULAR_IBL_


{{ require( "../../includes/ibl-rotation.glsl" )() }}
{{ require( "../../includes/octwrap-decode.glsl" )() }}
{{ require( "../../includes/decode-rgbe.glsl" )() }}


/* =========================================================
  OCTA
========================================================= */
#if iblType( OCTA )

  uniform sampler2D tEnv;

  #define SpecularIBL( tEnv, skyDir, roughness ) SampleIBL( tEnv, skyDir, roughness )


  const vec2 _IBL_UVM = vec2(
    0.25*(254.0/256.0),
    0.125*0.5*(254.0/256.0)
  );



  vec3 SampleIBL( sampler2D tEnv, vec3 skyDir, float roughness)
  {
    skyDir = IblRotateDir(skyDir);
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


/* =========================================================
  PMREM
========================================================= */
#elif iblType( PMREM ) && __VERSION__ == 300

  uniform samplerCube tEnv;

  #define SpecularIBL( tEnv, skyDir, roughness ) SampleIBLPMRem( tEnv, skyDir, roughness )


  const float MaxRangeRGBD = 255.0; 

  vec3 decodeRGBD(vec4 rgbd)
  {
    float a = max(rgbd.a, 0.0);
    return rgbd.rgb * ((MaxRangeRGBD / 255.0) / a);
  }

  vec3 SampleIBLPMRem( samplerCube tEnv, vec3 skyDir, float roughness)
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


#endif





vec3 ComputeIBLDiffuse( vec3 worldNormal ){
  // TODO: the model should set this varying in vertex shader
  #if perVertexIrrad
    return vIrradiance;
  #else
    return SampleSH(IblRotateDir(worldNormal), uSHCoeffs );
  #endif
}

#endif