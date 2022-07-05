#ifndef _H_IBLBOXPROJECTION_
#define _H_IBLBOXPROJECTION_


#if enableBoxProjection
  uniform vec3 uBoxProjMin;
  uniform vec3 uBoxProjMax;
  uniform vec3 uBoxProjPos;

  vec3 _iblBoxProj( vec3 reflectionWS, vec3 positionWS ) {

    vec3 boxMinMax = vec3(
      (reflectionWS.x > 0.0f) ? uBoxProjMax.x : uBoxProjMin.x,
      (reflectionWS.y > 0.0f) ? uBoxProjMax.y : uBoxProjMin.y,
      (reflectionWS.z > 0.0f) ? uBoxProjMax.z : uBoxProjMin.z
    );

    vec3 rbMinMax = (boxMinMax - positionWS) / reflectionWS;

    float fa = min(min(rbMinMax.x, rbMinMax.y), rbMinMax.z);

    vec3 worldPos = positionWS - uBoxProjPos;

    vec3 result = worldPos + reflectionWS * fa;
    return result;
  }

#endif

vec3 IblBoxProjection(vec3 reflectionWS, vec3 positionWS ){
  #if enableBoxProjection
  return _iblBoxProj( reflectionWS, positionWS );
  #else
  return reflectionWS;
  #endif
}

#endif