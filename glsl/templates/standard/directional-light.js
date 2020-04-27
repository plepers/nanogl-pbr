module.exports = function( obj ){
var __t,__p='';
__p+='\n{\n  Light light;\n\n  light.direction = uLDirDirections  ['+
(obj.index)+
']    ;\n  light.color     = uLDirColors      ['+
(obj.index)+
'].rgb;\n  light.attenuation = 1.0;\n\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\n    ShadowMapData shadowmapData = GET_SHADOWMAP_DATA( '+
(obj.shadowIndex)+
' );\n    light.shadowAttenuation = SampleShadowAttenuation(shadowmapData, tShadowMap'+
(obj.shadowIndex)+
', inputData.worldPos, inputData.worldNrm );\n  ';
 } else { 
__p+='\n    light.shadowAttenuation = 1.0;\n  ';
 } 
__p+='\n  \n  // TODO store ibl contrib in separate struct\n  // #if iblShadowing\n  //   float sDamp = uLDirColors['+
(obj.index)+
'].a;\n  //   specularColor *= mix( sDamp, 1.0, shOccl );\n  // #endif\n\n  color += LightingPhysicallyBased(brdfData, light, inputData.worldNrm, inputData.viewDir);\n}';
return __p;
}