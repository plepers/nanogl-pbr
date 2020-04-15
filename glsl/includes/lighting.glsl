
struct Light
{
  mediump vec3   direction;
  mediump vec3   color;
  mediump float  attenuation;
  mediump float  shadowAttenuation;
};



struct BRDFData
{
  mediump vec3 diffuse;
  mediump vec3 specular;
  mediump float perceptualRoughness;
  mediump float roughness;
  mediump float roughness2;
  mediump float grazingTerm;

    // We save some light invariant BRDF terms so we don't have to recompute
    // them in the light loop. Take a look at DirectBRDF function for detailed explaination.
  mediump float normalizationTerm;     // roughness * 4.0 + 2.0
  mediump float roughness2MinusOne;    // roughness^2 - 1.0
};



float DistanceAttenuation(float distanceSqr)
{
  return 1.0/distanceSqr;
}

float DistanceAttenuationRange(float distanceSqr, vec2 distanceAttenuation)
{
    float lightAtten = 1.0/distanceSqr;

#ifdef QUALITY_HI
    // Use the smoothing factor also used in the Unity lightmapper.
    float factor = distanceSqr * distanceAttenuation.x; // x = 1/range squared
    float smoothFactor = saturate(1.0h - factor * factor);
    smoothFactor = smoothFactor * smoothFactor;
#else
    float smoothFactor = saturate(distanceSqr * distanceAttenuation.x + distanceAttenuation.y);
#endif

    return lightAtten * smoothFactor;
}


mediump float AngleAttenuation(vec3 spotDirection, vec3 lightDirection, vec2 spotAttenuation)
{
    mediump float SdotL = dot(spotDirection, lightDirection);
    mediump float atten = saturate(SdotL * spotAttenuation.x + spotAttenuation.y);
    return atten * atten;
}



mediump vec3 LightingLambert(mediump vec3 lightColor, mediump vec3 lightDir, mediump vec3 normal)
{
    mediump float NdotL = saturate(dot(normal, lightDir));
    return lightColor * NdotL;
}

mediump vec3 LightingSpecular(mediump vec3 lightColor, vec3 lightDir, mediump vec3 normal, vec3 viewDir, mediump vec4 specular, mediump float smoothness)
{
    vec3 halfVec = normalize(lightDir + viewDir);
    mediump float NdotH = saturate(dot(normal, halfVec));
    mediump float modifier = pow(NdotH, smoothness);
    mediump vec3 specularReflection = specular.rgb * modifier;
    return lightColor * specularReflection;
}


mediump vec4 BlinnPhong(InputData inputData, mediump vec3 diffuse, mediump vec4 specularGloss, mediump float smoothness, mediump vec3 emission, mediump float alpha)
{
    // Light mainLight = GetMainLight(inputData.shadowCoord);

    // mediump vec3 attenuatedLightColor = mainLight.color * (mainLight.distanceAttenuation * mainLight.shadowAttenuation);
    // mediump vec3 diffuseColor = inputData.bakedGI + LightingLambert(attenuatedLightColor, mainLight.direction, inputData.normalWS);
    // mediump vec3 specularColor = LightingSpecular(attenuatedLightColor, mainLight.direction, inputData.normalWS, inputData.viewDirectionWS, specularGloss, smoothness);

    mediump vec3 diffuseColor  = vec3(0.0);
    mediump vec3 specularColor = vec3(0.0);

#ifdef _ADDITIONAL_LIGHTS
    uint pixelLightCount = GetAdditionalLightsCount();
    for (uint lightIndex = 0u; lightIndex < pixelLightCount; ++lightIndex)
    {
        
        // provided by light model
        Light light = GetAdditionalLight(lightIndex, inputData.positionWS);
        
        
        
        mediump vec3 attenuatedLightColor = light.color * (light.distanceAttenuation * light.shadowAttenuation);
        diffuseColor  += LightingLambert(attenuatedLightColor, light.direction, inputData.normalWS);
        specularColor += LightingSpecular(attenuatedLightColor, light.direction, inputData.normalWS, inputData.viewDirectionWS, specularGloss, smoothness);
    }
#endif

#ifdef _ADDITIONAL_LIGHTS_VERTEX
    diffuseColor += inputData.vertexLighting;
#endif

    mediump vec3 finalColor = diffuseColor * diffuse + emission;

#if defined(_SPECGLOSSMAP) || defined(_SPECULAR_COLOR)
    finalColor += specularColor;
#endif

    return vec4(finalColor, alpha);
}