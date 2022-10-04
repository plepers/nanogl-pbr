
#ifndef _H_DECODE_RGBD_
#define _H_DECODE_RGBD_

vec3 decodeRGBD(vec4 rgbd)
{
  return rgbd.rgb / rgbd.a;
}

#endif