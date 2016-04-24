module.exports = function( obj ){
var __t,__p='';
__p+='// --------- SPEC\n{\n\n  vec3 H = normalize( uLDirDirections['+
(obj.index)+
'] + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( uLDirDirections['+
(obj.index)+
'] ,worldNormal );\n\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\n  {\n    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector['+
(obj.shadowIndex)+
'], uShadowMatrices['+
(obj.shadowIndex)+
'] , worldNormal, SHADOW_KERNEL );\n    float shOccl = calcLightOcclusions(tShadowMap'+
(obj.shadowIndex)+
',fragCoord,kernelOffset);\n    dContrib *= shOccl;\n    sContib  *= shOccl;\n  }\n  ';
 } 
__p+='\n\n  diffuseCoef   += dContrib * uLDirColors['+
(obj.index)+
'];\n  specularColor += sContib  * uLDirColors['+
(obj.index)+
'];\n\n}';
return __p;
}