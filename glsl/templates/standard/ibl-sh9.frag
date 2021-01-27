#ifndef _H_IBL_SH_
#define _H_IBL_SH_

#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec3 uSHCoeffs[9];
#endif

{{ require("../../includes/spherical-harmonics-SH9.glsl")() }}

#endif