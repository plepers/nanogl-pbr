module.exports = function( obj ){
var __t,__p='';
__p+='#ifndef _H_IBL_SH_\n#define _H_IBL_SH_\n\n#if perVertexIrrad\n  IN vec3 vIrradiance;\n#else\n  uniform vec4 uSHCoeffs[7];\n#endif\n\n'+
( require("../../includes/spherical-harmonics-SH7.glsl")() )+
'\n\n#endif';
return __p;
}