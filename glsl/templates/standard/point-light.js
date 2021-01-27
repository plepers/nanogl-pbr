module.exports = function( obj ){
var __t,__p='';
__p+='\r\n{\r\n  vec3 lightPositionWS                    = uLPointPositions ['+
(obj.index)+
'].xyz;\r\n  mediump vec3 lightColor                 = uLPointColors    ['+
(obj.index)+
'].rgb;\r\n\r\n  vec3 lightVector = lightPositionWS - inputData.worldPos;\r\n  float distanceSqr = dot(lightVector, lightVector);\r\n\r\n  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));\r\n\r\n  ';
 if(obj.infinite){ 
__p+='\r\n    mediump float attenuation = DistanceAttenuation(distanceSqr);\r\n  ';
 } else { 
__p+='\r\n    float oneOverRangeSquared = uLPointPositions['+
(obj.index)+
'].w;\r\n    mediump float attenuation = DistanceAttenuationRange(distanceSqr, vec2(oneOverRangeSquared, 0.0));\r\n  ';
 } 
__p+='\r\n\r\n\r\n  Light light;\r\n  light.direction = lightDirection;\r\n  light.attenuation = attenuation;\r\n  light.color = lightColor;\r\n  light.shadowAttenuation = 1.0;\r\n\r\n  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);\r\n}';
return __p;
}