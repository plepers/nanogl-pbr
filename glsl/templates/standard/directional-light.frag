
{
  Light light;

  light.direction = uLDirDirections  [{{@index}}]    ;
  light.color     = uLDirColors      [{{@index}}].rgb;
  light.attenuation = 1.0;

  {{= if(obj.shadowIndex>-1){ }}
    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( {{@shadowIndex}} );
    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap{{@shadowIndex}}, geometryData.worldPos, geometryData.worldNrm );
  {{= } else { }}
    light.shadowAttenuation = 1.0;
  {{= } }}

  LightingPhysicallyBased(brdfData,  geometryData, lightingData, light );
}