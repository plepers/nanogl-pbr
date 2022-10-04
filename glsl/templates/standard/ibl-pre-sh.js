module.exports = function( obj ){
var __t,__p='';
__p+='#ifndef _H_IBL_SH_\n#define _H_IBL_SH_\n\n  #if perVertexIrrad\n\n    OUT vec3 vIrradiance;\n\n    #if shFormat( SH7 )\n      uniform vec4 uSHCoeffs[7];\n      '+
( require("../../includes/spherical-harmonics-SH7.glsl")() )+
'\n      #define SampleSH(dir, coeffs) SampleSH7(dir, coeffs)\n    #endif\n    \n    #if shFormat( SH9 )\n      uniform vec3 uSHCoeffs[9];\n      '+
( require("../../includes/spherical-harmonics-SH9.glsl")() )+
'\n      #define SampleSH(dir, coeffs) SampleSH9(dir, coeffs)\n    #endif\n\n  #endif\n\n#endif';
return __p;
}ndif\n';
return __p;
}