#ifndef _H_IBLROTATION_
#define _H_IBLROTATION_


#if enableRotation
  uniform mat3 uEnvMatrix;
#endif

vec3 IblRotateDir(vec3 dir){
  #if enableRotation
  return uEnvMatrix * dir;
  #else
  return dir;
  #endif
}

#endif