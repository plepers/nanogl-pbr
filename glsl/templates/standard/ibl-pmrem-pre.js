module.exports = function( obj ){
var __t,__p='';
__p+='#if __VERSION__ == 300\n\n#ifndef _H_SPECULAR_IBL_PMREM_\n#define _H_SPECULAR_IBL_PMREM_\n\n'+
( require( "../../includes/tonemap.glsl" )() )+
'\n\nuniform samplerCube tEnv;\n\nconst float MaxRangeRGBD = 255.0; \n\nvec3 decodeRGBD(vec4 rgbd)\n{\n    float a = max(rgbd.a, 0.00);\n    return rgbd.rgb * ((MaxRangeRGBD / 255.0) / a);\n}\n\n\nvec3 SpecularIBL( samplerCube tEnv, vec3 skyDir, float roughness)\n{\n\n  float r7   = 7.0*roughness;\n\n  float mipA = floor(r7);\n  float mipB = ceil(r7);\n  float delta = r7 - mipA;\n\n  #if glossNearest\n\n    return decodeRGBD( textureLod(tEnv,skyDir, mipA) );\n\n  #else\n\n    vec3 color = mix(\n      decodeRGBD( textureLod(tEnv, skyDir, mipA) ),\n      decodeRGBD( textureLod(tEnv, skyDir, mipB) ),\n      delta\n    );\n\n    return color;\n\n  #endif\n\n}\n\nvec3 ComputeIBLDiffuse( vec3 worldNormal ){\n  #if perVertexIrrad\n    return vIrradiance;\n  #else\n    return SampleSH(worldNormal, uSHCoeffs );\n  #endif\n}\n\n#endif\n#endif';
return __p;
}