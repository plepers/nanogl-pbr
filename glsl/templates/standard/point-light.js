module.exports = function( obj ){
var __t,__p='';
__p+='\n{\n  vec3 lightPositionWS                    = uLPointPositions ['+
(obj.index)+
'].xyz;\n  mediump vec3 lightColor                 = uLPointColors    ['+
(obj.index)+
'].rgb;\n\n  vec3 lightVector = lightPositionWS - inputData.worldPos;\n  float distanceSqr = dot(lightVector, lightVector);\n\n  mediump vec3 lightDirection = vec3(lightVector * inversesqrt(distanceSqr));\n\n  ';
 if(obj.infinite){ 
__p+='\n    mediump float attenuation = DistanceAttenuation(distanceSqr);\n  ';
 } else { 
__p+='\n    float oneOverRangeSquared = uLPointPositions['+
(obj.index)+
'].w;\n    mediump float attenuation = DistanceAttenuationRange(distanceSqr, vec2(oneOverRangeSquared, 0.0));\n  ';
 } 
__p+='\n\n\n  Light light;\n  light.direction = lightDirection;\n  light.attenuation = attenuation;\n  light.color = lightColor;\n  light.shadowAttenuation = 1.0;\n\n  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);\n}';
return __p;
}