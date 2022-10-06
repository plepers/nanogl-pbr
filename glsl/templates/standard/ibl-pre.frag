#ifndef _H_SPECULAR_IBL_
#define _H_SPECULAR_IBL_

{{ require( "../../includes/ibl-rotation.glsl" )() }}
{{ require( "../../includes/ibl-box-projection.glsl" )() }}


#if iblHdrEncoding( RGBM )
  {{ require( "../../includes/decode-rgbm.glsl" )() }}
  #define DECODE_HDR( x ) decodeRGBM16( x )
#elif iblHdrEncoding( RGBE )
  {{ require( "../../includes/decode-rgbe.glsl" )() }}
  #define DECODE_HDR( x ) decodeRGBE( x )
#elif iblHdrEncoding( RGBD )
  {{ require( "../../includes/decode-rgbd.glsl" )() }}
  #define DECODE_HDR( x ) decodeRGBD( x )
#endif

{{ require( "./ibl-pre-sh.frag" )() }}



vec3 ComputeIBLDiffuse( vec3 worldNormal ){
  // TODO: the model should set this varying in vertex shader
  #if perVertexIrrad
    return vIrradiance;
  #else
    return SampleSH(IblRotateDir(worldNormal), uSHCoeffs );
  #endif
}
#endif

/* =========================================================
  OCTA
========================================================= */
#if iblFormat( OCTA )
  

  #define OCTA_LEVELS iblNumMipLevel()
  #define OCTA_MAXLOD (OCTA_LEVELS-1.0)

  {{ require( "../../includes/octwrap-decode.glsl" )() }}

  uniform sampler2D tEnv;

  #define SpecularIBL( skyDir, roughness, wpos ) SampleIBL( skyDir, roughness, wpos )

  const vec2 _IBL_UVM = vec2(
    0.25*(254.0/256.0),
    0.125*0.5*(254.0/256.0)
  );

  vec3 SampleIBL( vec3 skyDir, float roughness, vec3 wpos)
  {
    skyDir = IblBoxProjection(skyDir, wpos);
    skyDir = IblRotateDir(skyDir);
    vec2 uvA = octwrapDecode( skyDir );
    
    float lodLevel   = OCTA_MAXLOD*roughness * (2.0 - roughness);
    float frac = fract(lodLevel);

    uvA = uvA * _IBL_UVM + vec2(
      0.5,
      0.125*0.5 + 0.125 * ( lodLevel - frac )
    );

    #if glossNearest

      return DECODE_HDR( texture2D(tEnv,uvA) );

    #else

      vec2 uvB=uvA+vec2(0.0,0.125);
      return  mix(
        DECODE_HDR( texture2D(tEnv,uvA) ),
        DECODE_HDR( texture2D(tEnv,uvB) ),
        frac
      );

    #endif

  }


/* =========================================================
  PMREM
========================================================= */
#elif iblFormat( PMREM ) && __VERSION__ == 300

  // assume 256 to 16 mip levels
  #define PMREM_LEVELS iblNumMipLevel()
  #define PMREM_MAXLOD (PMREM_LEVELS-1.0)
  
  uniform samplerCube tEnv;

  #define SpecularIBL( skyDir, roughness, wpos ) SampleIBLPMRem( skyDir, roughness, wpos )

  vec3 SampleIBLPMRem( vec3 skyDir, float roughness, vec3 wpos)
  {
    skyDir = IblBoxProjection(skyDir, wpos);
    skyDir = IblRotateDir(skyDir);

    float lodLevel   = PMREM_MAXLOD*roughness * (2.0 - roughness);
    return DECODE_HDR( textureLod( tEnv, skyDir, lodLevel) );
  }


#endif



