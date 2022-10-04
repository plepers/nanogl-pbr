#ifndef COLOR_INCLUDE
#define COLOR_INCLUDE 1

vec3 FastSRGBToLinear(vec3 c){
  return c * (c * (c * 0.305306011 + 0.682171111) + 0.012522878);
}

float FastSRGBToLinear(float c){
  return c * (c * (c * 0.305306011 + 0.682171111) + 0.012522878);
}

#endif
