
{
  vec3 lightPositionWS                    = uLPointPositions [{{@index}}].xyz;
  mediump vec3 lightColor                 = uLPointColors    [{{@index}}].rgb;

  vec3 lightVector = lightPositionWS - inputData.worldPos;
  float distanceSqr = dot(lightVector, lightVector);

  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));

  {{= if(obj.infinite){ }}
    mediump float attenuation = DistanceAttenuation(distanceSqr);
  {{= } else { }}
    float oneOverRangeSquared = uLPointPositions[{{@index}}].w;
    mediump float attenuation = DistanceAttenuationRange(distanceSqr, vec2(oneOverRangeSquared, 0.0);
  {{= } }}


  Light light;
  light.direction = lightDirection;
  light.attenuation = attenuation;
  light.color = lightColor;
  light.shadowAttenuation = 1.0;

  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);
}