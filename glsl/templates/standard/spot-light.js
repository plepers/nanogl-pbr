module.exports = function( obj ){
var __t,__p='';
__p+='\r\n{\r\n  vec3 lightPositionWS                    = uLSpotPositions  ['+
(obj.index)+
']    ;\r\n  mediump vec3 spotDirection              = uLSpotDirections ['+
(obj.index)+
']    ;\r\n  mediump vec3 lightColor                 = uLSpotColors     ['+
(obj.index)+
'].rgb;\r\n  mediump vec4 distanceAndSpotAttenuation = uLSpotAttenuation['+
(obj.index)+
']    ;\r\n\r\n  vec3 lightVector = lightPositionWS - inputData.worldPos;\r\n  float distanceSqr = dot(lightVector, lightVector);\r\n\r\n  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));\r\n\r\n  mediump float attenuation = AngleAttenuation(spotDirection.xyz, lightDirection, distanceAndSpotAttenuation.zw);\r\n  ';
 if(obj.infinite){ 
__p+='\r\n    attenuation *= DistanceAttenuation(distanceSqr);\r\n  ';
 } else { 
__p+='\r\n    attenuation *= DistanceAttenuationRange(distanceSqr, distanceAndSpotAttenuation.xy);\r\n  ';
 } 
__p+='\r\n\r\n\r\n  Light light;\r\n  light.direction = lightDirection;\r\n  light.attenuation = attenuation;\r\n  light.color = lightColor;\r\n\r\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\r\n    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( '+
(obj.shadowIndex)+
' );\r\n    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap'+
(obj.shadowIndex)+
', inputData.worldPos, inputData.worldNrm );\r\n  ';
 } else { 
__p+='\r\n    light.shadowAttenuation = 1.0;\r\n  ';
 } 
__p+='\r\n  \r\n  // TODO store ibl contrib in separate struct\r\n  // #if iblShadowing\r\n  //   float sDamp = uLSpotColors['+
(obj.index)+
'].a;\r\n  //   specularColor *= mix( sDamp, 1.0, shOccl );\r\n  // #endif\r\n\r\n  \r\n  // mediump vec3 attenuatedLightColor = light.color * (light.attenuation * light.shadowAttenuation);\r\n  // LS_DIFFUSE  += LightingLambert(attenuatedLightColor, light.direction, inputData.worldNrm);\r\n  // LS_SPECULAR += LightingSpecular(attenuatedLightColor, light.direction, inputData.worldNrm, inputData.viewDir, specularGloss, smoothness);\r\n\r\n  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);\r\n}';
return __p;
}