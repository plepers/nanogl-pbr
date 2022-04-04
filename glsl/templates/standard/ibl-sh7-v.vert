#ifndef _H_IBL_SH_
#define _H_IBL_SH_

#if perVertexIrrad

OUT vec3 vIrradiance;
uniform vec4 uSHCoeffs[7];

{{ require("../../includes/spherical-harmonics-SH7.glsl")() }}

{{ require( "../../includes/ibl-rotation.glsl" )() }}
#endif

#endif