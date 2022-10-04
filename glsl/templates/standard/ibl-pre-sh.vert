#ifndef _H_IBL_SH_
#define _H_IBL_SH_

  #if perVertexIrrad

    OUT vec3 vIrradiance;

    #if shFormat( SH7 )
      uniform vec4 uSHCoeffs[7];
      {{ require("../../includes/spherical-harmonics-SH7.glsl")() }}
      #define SampleSH(dir, coeffs) SampleSH7(dir, coeffs)
    #endif
    
    #if shFormat( SH9 )
      uniform vec3 uSHCoeffs[9];
      {{ require("../../includes/spherical-harmonics-SH9.glsl")() }}
      #define SampleSH(dir, coeffs) SampleSH9(dir, coeffs)
    #endif

  #endif

#endif