module.exports = function( obj ){
var __t,__p='';
__p+='\r\n{\r\n  Light light;\r\n\r\n  light.direction = uLDirDirections  ['+
(obj.index)+
']    ;\r\n  light.color     = uLDirColors      ['+
(obj.index)+
'].rgb;\r\n  light.attenuation = 1.0;\r\n\r\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\r\n    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( '+
(obj.shadowIndex)+
' );\r\n    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap'+
(obj.shadowIndex)+
', inputData.worldPos, inputData.worldNrm );\r\n  ';
 } else { 
__p+='\r\n    light.shadowAttenuation = 1.0;\r\n  ';
 } 
__p+='\r\n  \r\n  // TODO store ibl contrib in separate struct\r\n  // #if iblShadowing\r\n  //   float sDamp = uLDirColors['+
(obj.index)+
'].a;\r\n  //   specularColor *= mix( sDamp, 1.0, shOccl );\r\n  // #endif\r\n\r\n  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);\r\n}';
return __p;
}