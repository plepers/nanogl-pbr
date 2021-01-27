#ifndef _H_SAMPLE_SH_
#define _H_SAMPLE_SH_

// ================================
// compute Spherical Harmonics
// ================================
//
// 5.3.4.1
// Diffuse BRDF integration
// https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/distantlightprobes
vec3 SampleSH( vec3 Normal, vec3 shCoeffs[9] )
{

  vec3 n = Normal;
  vec3 value = 
        shCoeffs[0]
      + shCoeffs[1] * (n.y)
      + shCoeffs[2] * (n.z)
      + shCoeffs[3] * (n.x)
      + shCoeffs[4] * (n.y * n.x)
      + shCoeffs[5] * (n.y * n.z)
      + shCoeffs[6] * (3.0 * n.z * n.z - 1.0)
      + shCoeffs[7] * (n.z * n.x)
      + shCoeffs[8] * (n.x * n.x - n.y * n.y);

  return max(vec3(0.0), value);

}


#endif
