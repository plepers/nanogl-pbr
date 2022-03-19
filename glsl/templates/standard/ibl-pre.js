module.exports = function( obj ){
var __t,__p='';
__p+='\n\n#ifndef _H_SPECULAR_IBL_\n#define _H_SPECULAR_IBL_\n\n\n'+
( require( "../../includes/ibl-rotation.glsl" )() )+
'\n'+
( require( "../../includes/octwrap-decode.glsl" )() )+
'\n'+
( require( "../../includes/decode-rgbe.glsl" )() )+
'\n\n\n\n// IBL\n// ========\nuniform sampler2D tEnv;\n\n\n\n\n\nconst vec2 _IBL_UVM = vec2(\n  0.25*(254.0/256.0),\n  0.125*0.5*(254.0/256.0)\n);\n\n\n\nvec3 SpecularIBL( sampler2D tEnv, vec3 skyDir, float roughness)\n{\n  skyDir = IblRotateDir(skyDir);\n  vec2 uvA = octwrapDecode( skyDir );\n\n  float r7   = 7.0*roughness;\n  float frac = fract(r7);\n\n  uvA = uvA * _IBL_UVM + vec2(\n      0.5,\n      0.125*0.5 + 0.125 * ( r7 - frac )\n    );\n\n  #if glossNearest\n\n    return decodeRGBE( texture2D(tEnv,uvA) );\n\n  #else\n\n    vec2 uvB=uvA+vec2(0.0,0.125);\n    return  mix(\n      decodeRGBE( texture2D(tEnv,uvA) ),\n      decodeRGBE( texture2D(tEnv,uvB) ),\n      frac\n    );\n\n  #endif\n\n}\n\n\nvec3 ComputeIBLDiffuse( vec3 worldNormal ){\n  // TODO: the model should set this varying in vertex shader\n  #if perVertexIrrad\n    return vIrradiance;\n  #else\n    return SampleSH(IblRotateDir(worldNormal), uSHCoeffs );\n  #endif\n}\n\n#endif';
return __p;
}