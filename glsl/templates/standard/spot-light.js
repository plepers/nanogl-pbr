module.exports = function( obj ){
var __t,__p='';
__p+='\n{\n  vec3 lightPositionWS                    = uLSpotPositions  ['+
(obj.index)+
']    ;\n  mediump vec3 spotDirection              = uLSpotDirections ['+
(obj.index)+
']    ;\n  mediump vec3 lightColor                 = uLSpotColors     ['+
(obj.index)+
'].rgb;\n  mediump vec4 distanceAndSpotAttenuation = uLSpotAttenuation['+
(obj.index)+
']    ;\n\n  vec3 lightVector = lightPositionWS - geometryData.worldPos;\n  float distanceSqr = dot(lightVector, lightVector);\n\n  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));\n\n  mediump float attenuation = AngleAttenuation(spotDirection.xyz, lightDirection, distanceAndSpotAttenuation.zw);\n  ';
 if(obj.infinite){ 
__p+='\n    attenuation *= DistanceAttenuation(distanceSqr);\n  ';
 } else { 
__p+='\n    attenuation *= DistanceAttenuationRange(distanceSqr, distanceAndSpotAttenuation.xy);\n  ';
 } 
__p+='\n\n\n  Light light;\n  light.direction = lightDirection;\n  light.attenuation = attenuation;\n  light.color = lightColor;\n\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\n    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( '+
(obj.shadowIndex)+
' );\n    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap'+
(obj.shadowIndex)+
', geometryData.worldPos, geometryData.worldNrm );\n  ';
 } else { 
__p+='\n    light.shadowAttenuation = 1.0;\n  ';
 } 
__p+='\n  \n  // TODO store ibl contrib in separate struct\n  // #if iblShadowing\n  //   float sDamp = uLSpotColors['+
(obj.index)+
'].a;\n  //   specularColor *= mix( sDamp, 1.0, shOccl );\n  // #endif\n\n  \n  // mediump vec3 attenuatedLightColor = light.color * (light.attenuation * light.shadowAttenuation);\n  // LS_DIFFUSE  += LightingLambert(attenuatedLightColor, light.direction, geometryData.worldNrm);\n  // LS_SPECULAR += LightingSpecular(attenuatedLightColor, light.direction, geometryData.worldNrm, geometryData.viewDir, specularGloss, smoothness);\n\n  LightingPhysicallyBased(brdfData,  geometryData, lightingData, light );\n}';
return __p;
}