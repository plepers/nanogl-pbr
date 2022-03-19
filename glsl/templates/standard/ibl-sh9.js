module.exports = function( obj ){
var __t,__p='';
__p+='#ifndef _H_IBL_SH_\n#define _H_IBL_SH_\n\n#if perVertexIrrad\n\nOUT vec3 vIrradiance;\nuniform vec3 uSHCoeffs[9];\n\n'+
( require("../../includes/spherical-harmonics-SH9.glsl")() )+
'\n\n'+
( require( "../../includes/ibl-rotation.glsl" )() )+
'\n#endif\n\n#endif';
return __p;
}