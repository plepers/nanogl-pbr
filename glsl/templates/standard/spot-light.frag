
{
  vec3 lightPositionWS                    = uLSpotPositions  [{{@index}}]    ;
  mediump vec3 spotDirection              = uLSpotDirections [{{@index}}]    ;
  mediump vec3 lightColor                 = uLSpotColors     [{{@index}}].rgb;
  mediump vec4 distanceAndSpotAttenuation = uLSpotAttenuation[{{@index}}]    ;

  vec3 lightVector = lightPositionWS - inputData.worldPos;
  float distanceSqr = dot(lightVector, lightVector);

  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));

  mediump float attenuation = AngleAttenuation(spotDirection.xyz, lightDirection, distanceAndSpotAttenuation.zw);
  {{= if(obj.infinite){ }}
    attenuation *= DistanceAttenuation(distanceSqr);
  {{= } else { }}
    attenuation *= DistanceAttenuationRange(distanceSqr, distanceAndSpotAttenuation.xy);
  {{= } }}


  Light light;
  light.direction = lightDirection;
  light.attenuation = attenuation;
  light.color = lightColor;

  {{= if(obj.shadowIndex>-1){ }}
    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( {{@shadowIndex}} );
    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap{{@shadowIndex}}, inputData.worldPos, inputData.worldNrm );
  {{= } else { }}
    light.shadowAttenuation = 1.0;
  {{= } }}
  
  // TODO store ibl contrib in separate struct
  // #if iblShadowing
  //   float sDamp = uLSpotColors[{{@index}}].a;
  //   specularColor *= mix( sDamp, 1.0, shOccl );
  // #endif

  
  // mediump vec3 attenuatedLightColor = light.color * (light.attenuation * light.shadowAttenuation);
  // LS_DIFFUSE  += LightingLambert(attenuatedLightColor, light.direction, inputData.worldNrm);
  // LS_SPECULAR += LightingSpecular(attenuatedLightColor, light.direction, inputData.worldNrm, inputData.viewDir, specularGloss, smoothness);

  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);
}