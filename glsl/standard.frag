#pragma SLOT version

#pragma SLOT definitions


#ifndef hasNormals
  #define hasNormals 1
#endif 
#ifndef hasTangents
  #define hasTangents hasNormals
#endif 

#if hasTangents && !hasNormals 
  #pragma error tan but no nrm
  error
#endif


#if !hasTangents && __VERSION__ != 300
  #extension GL_OES_standard_derivatives : enable
#endif 

#pragma SLOT precision

{{ require( "./includes/glsl-compat.frag" )() }}
{{ require( "./includes/pbr-inputs-decl.glsl" )() }}

#pragma SLOT pf


uniform vec3 uCameraPosition;
IN vec3 vWorldPosition;

#if hasNormals
IN mediump vec3 vWorldNormal;
#endif 

#if HAS_normal && hasTangents
IN mediump vec3 vWorldTangent;
IN mediump vec3 vWorldBitangent;
#endif 




// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// INCLUDES
// =========



struct InputData
{
    vec3  worldPos;
    mediump vec3   worldNrm;
    mediump vec3   viewDir;
};



{{ require( "./includes/normals.glsl" )() }}
{{ require( "./includes/tonemap.glsl" )() }}
{{ require( "./includes/lighting.glsl" )() }}


// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 spec,float glo )
{
  float dot = glo*glo * pow( 1.0-VoH, 5.0 );
  return( 1.0 - dot )*spec + dot;
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



void InitializeBRDFData(SurfaceData surface, out BRDFData brdf)
{
    mediump float reflectivity = ReflectivitySpecular(surface.specular);
    mediump float oneMinusReflectivity = 1.0 - reflectivity;

    brdf.diffuse = surface.albedo * (vec3(1.0, 1.0, 1.0) - surface.specular);
    brdf.specular = surface.specular;

    brdf.grazingTerm = saturate(surface.smoothness + reflectivity);
    brdf.perceptualRoughness = PerceptualSmoothnessToPerceptualRoughness(surface.smoothness);
    brdf.roughness = max(PerceptualRoughnessToRoughness(brdf.perceptualRoughness), 0.001);
    brdf.roughness2 = brdf.roughness * brdf.roughness;

    brdf.normalizationTerm = brdf.roughness * 4.0 + 2.0;
    brdf.roughness2MinusOne = brdf.roughness2 - 1.0;

// #ifdef _ALPHAPREMULTIPLY_ON
//     outBRDFData.diffuse *= alpha;
//     alpha = alpha * oneMinusReflectivity + reflectivity;
// #endif
}

mediump vec3 DirectBDRF(BRDFData brdfData, mediump vec3 normalWS, mediump vec3 lightDirectionWS, mediump vec3 viewDirectionWS)
{
  vec3 halfDir = normalize(lightDirectionWS + viewDirectionWS);// TODO: safe normalize?

  float NoH = saturate(dot(normalWS, halfDir));
  mediump float LoH = saturate(dot(lightDirectionWS, halfDir));

  // GGX Distribution multiplied by combined approximation of Visibility and Fresnel
  // BRDFspec = (D * V * F) / 4.0
  // D = roughness^2 / ( NoH^2 * (roughness^2 - 1) + 1 )^2
  // V * F = 1.0 / ( LoH^2 * (roughness + 0.5) )
  // See "Optimizing PBR for Mobile" from Siggraph 2015 moving mobile graphics course
  // https://community.arm.com/events/1155

  // Final BRDFspec = roughness^2 / ( NoH^2 * (roughness^2 - 1) + 1 )^2 * (LoH^2 * (roughness + 0.5) * 4.0)
  // We further optimize a few light invariant terms
  // brdfData.normalizationTerm = (roughness + 0.5) * 4.0 rewritten as roughness * 4.0 + 2.0 to a fit a MAD.
  float d = NoH * NoH * brdfData.roughness2MinusOne + 1.00001;

  mediump float LoH2 = LoH * LoH;
  mediump float specularTerm = brdfData.roughness2 / ((d * d) * max(0.1, LoH2) * brdfData.normalizationTerm);

  // On platforms where half actually means something, the denominator has a risk of overflow
  // clamp below was added specifically to "fix" that, but dx compiler (we convert bytecode to metal/gles)
  // sees that specularTerm have only non-negative terms, so it skips max(0,..) in clamp (leaving only min(100,...))
// #if defined (SHADER_API_MOBILE) || defined (SHADER_API_SWITCH)
//     specularTerm = specularTerm - HALF_MIN;
//     specularTerm = clamp(specularTerm, 0.0, 100.0); // Prevent FP16 overflow on mobiles
// #endif

  mediump vec3 color = specularTerm * brdfData.specular + brdfData.diffuse;
  return color;
}



mediump vec3 LightingPhysicallyBased(BRDFData brdfData, mediump vec3 lightColor, mediump vec3 lightDirectionWS, mediump float lightAttenuation, mediump vec3 normalWS, mediump vec3 viewDirectionWS)
{
    mediump float NdotL = saturate(dot(normalWS, lightDirectionWS));
    mediump vec3 radiance = lightColor * (lightAttenuation * NdotL);
    return DirectBDRF(brdfData, normalWS, lightDirectionWS, viewDirectionWS) * radiance;
}

mediump vec3 LightingPhysicallyBased(BRDFData brdfData, Light light, mediump vec3 normalWS, mediump vec3 viewDirectionWS)
{
    return LightingPhysicallyBased(brdfData, light.color, light.direction, light.attenuation * light.shadowAttenuation, normalWS, viewDirectionWS);
}



//                MAIN
// ===================

void main( void ){

  #pragma SLOT f


  SurfaceData surface;
  #pragma SLOT pbrsurface

  #if alphaMode( MASK )
    if( surface.alpha < alphaCutoff() ) discard;
  #endif

  //
  #ifdef HAS_vertexColor
  #if HAS_vertexColor
    surface.albedo *= vertexColor();
  #endif
  #endif



  // -----------


  InputData inputData;
  inputData.worldPos = vWorldPosition;
  inputData.viewDir  = normalize( uCameraPosition - vWorldPosition ); // safe normalize?
  inputData.worldNrm = COMPUTE_NORMAL();
  // inputData.vertexLighting = input.fogFactorAndVertexLight.yzw;


  BRDFData brdfData;
  InitializeBRDFData( surface, brdfData );


  // used by IBL reflexion
  // --------------
  vec3 worldReflect = reflect( -inputData.viewDir, inputData.worldNrm );
  float NoV = sdot( inputData.viewDir, inputData.worldNrm );




  vec3 diffuseContrib = vec3(0.0);
  vec3 specularContrib = vec3(0.0);

  vec3 color = vec3(0.0);

  #define LS_SPECULAR specularContrib
  #define LS_DIFFUSE  diffuseContrib

  #pragma SLOT lightsf

  // todo: apply this only to ibl contrib
  // add proper Fresnel to ponctual lights
  specularContrib *= F_Schlick( NoV, brdfData.specular, surface.smoothness );
  color += surface.occlusion * (diffuseContrib*brdfData.diffuse + specularContrib);

  color += surface.emission;




  #if alphaMode( MASK )
    FragColor.a = 1.0;
  #elif alphaMode( BLEND )
    FragColor.a = surface.alpha;
  #else
    FragColor.a = 1.0;
  #endif


//   vec3 color = diffuseContrib*surface.albedo + specularContrib;


//  #if HAS_occlusion
//     float _occlusion = occlusion();
//     #if HAS_occlusionStrength
//       _occlusion = 1.0 - occlusionStrength() + _occlusion*occlusionStrength();
//     #endif
//     color *= _occlusion;
//   #endif


  FragColor.rgb = color;

  EXPOSURE(FragColor.rgb);
  GAMMA_CORRECTION(FragColor.rgb);




  // FragColor.a = 1.0;

  // FragColor.rgb = FragColor.rgb*0.0001 + surface.albedo;
  // FragColor.rgb = FragColor.rgb*0.0001 + surface.specularF0;
  // FragColor.rgb = FragColor.rgb*0.0001 + specularContrib;
  // FragColor.rgb = FragColor.rgb*0.0001 + albedo();
  // FragColor.rgb = FragColor.rgb*0.0001 + albedoSq;
  // FragColor.rgb = FragColor.rgb*0.0001 + diffuseContrib;
  // FragColor.rgb = FragColor.rgb*0.0001 + worldNormal;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldNormal;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldBitangent;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldTangent;
  // FragColor.rgb = FragColor.rgb*0.0001 + vec3(1.0, 0.0, 0.0);
  // FragColor.rg = vec2(0.0);

  // pure mirror

  // vec3 _rr = reflect( -viewDir, vWorldNormal );
  // vec3 purerefl = SpecularIBL( tEnv, _rr, 0.0 );
  // FragColor.rgb = FragColor.rgb*0.0001 + purerefl;

  #if HAS_normal
  // FragColor.rgb = FragColor.rgb*0.0001 + normal();
  #endif

  #if HAS_occlusion
    // FragColor.rgb = FragColor.rgb*0.0001 + occlusion();
  #endif


  // #ifdef HAS_GI
  // #if HAS_GI
  //   FragColor.rgb = FragColor.rgb*0.0001 + gi;
  // #endif
  // #endif


}