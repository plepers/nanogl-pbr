module.exports = function( obj ){
var __t,__p='';
__p+='#ifndef _H_IBL_SH_\r\n#define _H_IBL_SH_\r\n\r\n#if perVertexIrrad\r\n  IN vec3 vIrradiance;\r\n#else\r\n  uniform vec4 uSHCoeffs[7];\r\n#endif\r\n\r\n'+
( require("../../includes/spherical-harmonics-SH7.glsl")() )+
'\r\n\r\n#endif';
return __p;
}