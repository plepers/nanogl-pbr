module.exports = function( obj ){
var __t,__p='';
__p+='// --------- SPEC\n{\n  vec3 H = normalize( uLDirDirections['+
(obj.index)+
'] + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( uLDirDirections['+
(obj.index)+
'] ,worldNormal );\n\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\n  {\n    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector['+
(obj.shadowIndex)+
'], uShadowMatrices['+
(obj.shadowIndex)+
'] , vWorldPosition, worldNormal, uShadowMapSize['+
(obj.shadowIndex)+
'].y );\n    float shOccl = calcLightOcclusions(tShadowMap'+
(obj.shadowIndex)+
',fragCoord,uShadowMapSize['+
(obj.shadowIndex)+
']);\n    dContrib *= shOccl;\n    sContib  *= shOccl;\n    \n    #if iblShadowing\n      float sDamp = uLDirColors['+
(obj.index)+
'].a;\n      specularColor *= mix( sDamp, 1.0, shOccl );\n    #endif\n  }\n  ';
 } 
__p+='\n\n  LS_DIFFUSE  += dContrib * uLDirColors['+
(obj.index)+
'].rgb;\n  LS_SPECULAR += sContib  * uLDirColors['+
(obj.index)+
'].rgb;\n\n}';
return __p;
}