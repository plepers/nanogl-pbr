
#ifndef _H_DECODE_RGBM_
#define _H_DECODE_RGBM_

vec3 decodeRGBM16( vec4 rgbm ){
  vec3 c = ( rgbm.rgb * 16.0 * rgbm.a );
  return c*c;
}

#endif