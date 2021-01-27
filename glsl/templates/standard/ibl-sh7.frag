#ifndef _H_IBL_SH_
#define _H_IBL_SH_

#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec4 uSHCoeffs[7];
#endif

{{ require("../../includes/spherical-harmonics-SH7.glsl")() }}

#endif