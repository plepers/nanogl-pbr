module.exports = function( obj ){
var __t,__p='';
__p+='\r\n\r\n#ifndef _H_SPECULAR_IBL_\r\n#define _H_SPECULAR_IBL_\r\n\r\n\r\n'+
( require( "../../includes/octwrap-decode.glsl" )() )+
'\r\n'+
( require( "../../includes/decode-rgbe.glsl" )() )+
'\r\n\r\n\r\n\r\n// IBL\r\n// ========\r\nuniform sampler2D tEnv;\r\n\r\n\r\n\r\n\r\n\r\nconst vec2 _IBL_UVM = vec2(\r\n  0.25*(254.0/256.0),\r\n  0.125*0.5*(254.0/256.0)\r\n);\r\n\r\n\r\n\r\nvec3 SpecularIBL( sampler2D tEnv, vec3 skyDir, float roughness)\r\n{\r\n\r\n  vec2 uvA = octwrapDecode( skyDir );\r\n\r\n  float r7   = 7.0*roughness;\r\n  float frac = fract(r7);\r\n\r\n  uvA = uvA * _IBL_UVM + vec2(\r\n      0.5,\r\n      0.125*0.5 + 0.125 * ( r7 - frac )\r\n    );\r\n\r\n  #if glossNearest\r\n\r\n    return decodeRGBE( texture2D(tEnv,uvA) );\r\n\r\n  #else\r\n\r\n    vec2 uvB=uvA+vec2(0.0,0.125);\r\n    return  mix(\r\n      decodeRGBE( texture2D(tEnv,uvA) ),\r\n      decodeRGBE( texture2D(tEnv,uvB) ),\r\n      frac\r\n    );\r\n\r\n  #endif\r\n\r\n}\r\n\r\n\r\n\r\nvec3 ComputeIBLDiffuse( vec3 worldNormal ){\r\n  #if perVertexIrrad\r\n    return vIrradiance;\r\n  #else\r\n    return SampleSH(worldNormal, uSHCoeffs );\r\n  #endif\r\n}\r\n\r\n#endif';
return __p;
}