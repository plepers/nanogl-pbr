
{
  Light light;

  light.direction = uLDirDirections  [{{@index}}]    ;
  light.color     = uLDirColors      [{{@index}}].rgb;
  light.attenuation = 1.0;

  {{= if(obj.shadowIndex>-1){ }}
    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( {{@shadowIndex}} );
    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap{{@shadowIndex}}, inputData.worldPos, inputData.worldNrm );
  {{= } else { }}
    light.shadowAttenuation = 1.0;
  {{= } }}
  
  // TODO store ibl contrib in separate struct
  // #if iblShadowing
  //   float sDamp = uLDirColors[{{@index}}].a;
  //   specularColor *= mix( sDamp, 1.0, shOccl );
  // #endif

  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);
}