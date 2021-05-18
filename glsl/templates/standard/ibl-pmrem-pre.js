module.exports = function( obj ){
var __t,__p='';
__p+='#if __VERSION__ == 300\r\n\r\n#ifndef _H_SPECULAR_IBL_PMREM_\r\n#define _H_SPECULAR_IBL_PMREM_\r\n\r\n'+
( require( "../../includes/tonemap.glsl" )() )+
'\r\n\r\nuniform samplerCube tEnv;\r\n\r\nconst float MaxRangeRGBD = 255.0; \r\n\r\nvec3 decodeRGBD(vec4 rgbd)\r\n{\r\n    float a = max(rgbd.a, 0.00);\r\n    return rgbd.rgb * ((MaxRangeRGBD / 255.0) / a);\r\n}\r\n\r\n\r\nvec3 SpecularIBL( samplerCube tEnv, vec3 skyDir, float roughness)\r\n{\r\n\r\n  float r7   = 7.0*roughness;\r\n\r\n  float mipA = floor(r7);\r\n  float mipB = ceil(r7);\r\n  float delta = r7 - mipA;\r\n\r\n  #if glossNearest\r\n\r\n    return decodeRGBD( textureLod(tEnv,skyDir, mipA) );\r\n\r\n  #else\r\n\r\n    vec3 color = mix(\r\n      decodeRGBD( textureLod(tEnv, skyDir, mipA) ),\r\n      decodeRGBD( textureLod(tEnv, skyDir, mipB) ),\r\n      delta\r\n    );\r\n\r\n    return color;\r\n\r\n  #endif\r\n\r\n}\r\n\r\nvec3 ComputeIBLDiffuse( vec3 worldNormal ){\r\n  #if perVertexIrrad\r\n    return vIrradiance;\r\n  #else\r\n    return SampleSH(worldNormal, uSHCoeffs );\r\n  #endif\r\n}\r\n\r\n#endif\r\n#endif';
return __p;
}