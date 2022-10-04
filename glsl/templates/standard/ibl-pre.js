module.exports = function( obj ){
var __t,__p='';
__p+='#ifndef _H_SPECULAR_IBL_\n#define _H_SPECULAR_IBL_\n\n'+
( require( "../../includes/ibl-rotation.glsl" )() )+
'\n'+
( require( "../../includes/ibl-box-projection.glsl" )() )+
'\n\n\n#if iblHdrEncoding( RGBM )\n  '+
( require( "../../includes/decode-rgbm.glsl" )() )+
'\n  #define DECODE_HDR( x ) decodeRGBM16( x )\n#elif iblHdrEncoding( RGBE )\n  '+
( require( "../../includes/decode-rgbe.glsl" )() )+
'\n  #define DECODE_HDR( x ) decodeRGBE( x )\n#elif iblHdrEncoding( RGBD )\n  '+
( require( "../../includes/decode-rgbd.glsl" )() )+
'\n  #define DECODE_HDR( x ) decodeRGBD( x )\n#endif\n\n'+
( require( "./ibl-pre-sh.frag" )() )+
'\n\n\n\nvec3 ComputeIBLDiffuse( vec3 worldNormal ){\n  // TODO: the model should set this varying in vertex shader\n  #if perVertexIrrad\n    return vIrradiance;\n  #else\n    return SampleSH(IblRotateDir(worldNormal), uSHCoeffs );\n  #endif\n}\n#endif\n\n/* =========================================================\n  OCTA\n========================================================= */\n#if iblFormat( OCTA )\n  \n\n  #define OCTA_LEVELS 8\n  #define OCTA_MAXLOD float(OCTA_LEVELS-1)\n\n  '+
( require( "../../includes/octwrap-decode.glsl" )() )+
'\n\n  uniform sampler2D tEnv;\n\n  #define SpecularIBL( skyDir, roughness, wpos ) SampleIBL( skyDir, roughness, wpos )\n\n  const vec2 _IBL_UVM = vec2(\n    0.25*(254.0/256.0),\n    0.125*0.5*(254.0/256.0)\n  );\n\n  vec3 SampleIBL( vec3 skyDir, float roughness, vec3 wpos)\n  {\n    skyDir = IblBoxProjection(skyDir, wpos);\n    skyDir = IblRotateDir(skyDir);\n    vec2 uvA = octwrapDecode( skyDir );\n    \n    float lodLevel   = OCTA_MAXLOD*roughness * (2.0 - roughness);\n    float frac = fract(lodLevel);\n\n    uvA = uvA * _IBL_UVM + vec2(\n      0.5,\n      0.125*0.5 + 0.125 * ( lodLevel - frac )\n    );\n\n    #if glossNearest\n\n      return DECODE_HDR( texture2D(tEnv,uvA) );\n\n    #else\n\n      vec2 uvB=uvA+vec2(0.0,0.125);\n      return  mix(\n        DECODE_HDR( texture2D(tEnv,uvA) ),\n        DECODE_HDR( texture2D(tEnv,uvB) ),\n        frac\n      );\n\n    #endif\n\n  }\n\n\n/* =========================================================\n  PMREM\n========================================================= */\n#elif iblFormat( PMREM ) && __VERSION__ == 300\n\n  // assume 256 to 16 mip levels\n  #define PMREM_LEVELS 5\n  #define PMREM_MAXLOD float(PMREM_LEVELS-1)\n  \n  uniform samplerCube tEnv;\n\n  #define SpecularIBL( skyDir, roughness, wpos ) SampleIBLPMRem( skyDir, roughness, wpos )\n\n  vec3 SampleIBLPMRem( vec3 skyDir, float roughness, vec3 wpos)\n  {\n    skyDir = IblBoxProjection(skyDir, wpos);\n    skyDir = IblRotateDir(skyDir);\n\n    float lodLevel   = PMREM_MAXLOD*roughness * (2.0 - roughness);\n    return DECODE_HDR( textureLod( tEnv, skyDir, lodLevel) );\n  }\n\n\n#endif\n\n\n\n';
return __p;
}