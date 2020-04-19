
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
  float factor = distanceSqr * distanceAttenuation.x; // x = 1/range squared
  float smoothFactor = saturate(1.0 - factor * factor);
  smoothFactor = smoothFactor * smoothFactor;

  float lightAtten = 1.0/distanceSqr;
  return lightAtten * smoothFactor;
}


mediump float AngleAttenuation(vec3 spotDirection, vec3 lightDirection, vec2 spotAttenuation)
{
  mediump float SdotL = dot(spotDirection, lightDirection);
  mediump float atten = saturate(SdotL * spotAttenuation.x + spotAttenuation.y);
  return atten * atten;
}




mediump float ReflectivitySpecular(mediump vec3 specular)
{
  #ifdef QUALITY_HI
    return max(max(specular.r, specular.g), specular.b);
  #else
    return specular.r;
  #endif
}

#define PerceptualSmoothnessToPerceptualRoughness(perceptualSmoothness) (1.0 - perceptualSmoothness)
#define PerceptualRoughnessToRoughness(perceptualRoughness) (perceptualRoughness * perceptualRoughness)



// "Optimizing PBR for Mobile" from Siggraph 2015 moving mobile graphics course
// https://community.arm.com/events/1155
mediump vec3 GGXZiomaBDRF(BRDFData brdfData, mediump vec3 normalWS, mediump vec3 wLightDir, mediump vec3 wViewDir)
{
  vec3 halfDir = normalize(wLightDir + wViewDir);
  float NoH = sdot(normalWS, halfDir);
  mediump float LoH = sdot(wLightDir, halfDir);
  float d = NoH * NoH * brdfData.roughness2MinusOne + 1.00001;
  mediump float LoH2 = LoH * LoH;
  mediump float specularTerm = brdfData.roughness2 / ((d * d) * max(0.1, LoH2) * brdfData.normalizationTerm);
  mediump vec3 color = specularTerm * brdfData.specular + brdfData.diffuse;
  return color;
}



mediump vec3 LightingPhysicallyBased(BRDFData brdfData, Light light, mediump vec3 wNormal, mediump vec3 wViewDir)
{
    mediump float NdotL = sdot(wNormal, light.direction);
    mediump vec3 inputLight = light.color * (light.attenuation * light.shadowAttenuation * NdotL);
    return GGXZiomaBDRF(brdfData, wNormal, light.direction, wViewDir) * inputLight;
}

// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 spec,float glo )
{
  float dot = glo*glo * pow( 1.0-VoH, 5.0 );
  return( 1.0 - dot )*spec + dot;
}


mediump vec3 LightingLambert(mediump vec3 lightColor, mediump vec3 lightDir, mediump vec3 normal)
{
    mediump float NoL = sdot(normal, lightDir);
    return lightColor * NoL;
}

mediump vec3 LightingSpecular(mediump vec3 lightColor, vec3 lightDir, mediump vec3 normal, vec3 viewDir, mediump vec4 specular, mediump float smoothness)
{
    vec3 halfVec = normalize(lightDir + viewDir);
    mediump float NoH = sdot(normal, halfVec);
    mediump float modifier = pow(NoH, smoothness);
    mediump vec3 specularReflection = specular.rgb * modifier;
    return lightColor * specularReflection;
}
