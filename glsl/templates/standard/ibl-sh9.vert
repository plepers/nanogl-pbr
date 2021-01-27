#ifndef _H_IBL_SH_
#define _H_IBL_SH_

#if perVertexIrrad

OUT vec3 vIrradiance;
uniform vec3 uSHCoeffs[9];

{{ require("../../includes/spherical-harmonics-SH9.glsl")() }}

#endif

#endif