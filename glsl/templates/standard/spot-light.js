module.exports = function( obj ){
var __t,__p='';
__p+='{\n\n  vec3 lightDir= uLSpotPositions['+
(obj.index)+
'] - vWorldPosition;\n  float lightdist = length(lightDir);\n  lightDir /= lightdist;\n\n  // falloff\n  \n\n  ';
 if(obj.infinite){ 
__p+='\n  float falloff = 1.0 / (lightdist*lightdist);\n  ';
 } else { 
__p+='\n  float distFactor = pow( lightdist/uLSpotDirections['+
(obj.index)+
'].w, 4.0 );\n  float falloff = clamp( 1.0 - distFactor, 0.0, 1.0 ) / (lightdist*lightdist);\n  ';
 } 
__p+='\n\n  // cone\n  float cd= dot( lightDir, uLSpotDirections['+
(obj.index)+
'].xyz );\n  float angularAttenuation = saturate(cd * uLSpotCone['+
(obj.index)+
'].x + uLSpotCone['+
(obj.index)+
'].y);\n  angularAttenuation *= angularAttenuation;\n\n  vec3 lightContrib = (falloff * angularAttenuation ) * uLSpotColors['+
(obj.index)+
'].rgb;\n\n\n  // --------- SPEC\n  vec3 H = normalize( lightDir + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContrib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );\n\n  ';
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
']);\n    dContrib *= shOccl;\n    sContrib  *= shOccl;\n\n    #if iblShadowing\n      float sDamp = uLSpotColors['+
(obj.index)+
'].a;\n      specularColor *= mix( sDamp, 1.0, shOccl );\n    #endif\n\n    // sContrib = sin( decodeDepthRGB(texture2D(tShadowMap'+
(obj.shadowIndex)+
',fragCoord.xy).xyz)*200.0);\n    // dContrib = sin( decodeDepthRGB(texture2D(tShadowMap'+
(obj.shadowIndex)+
',fragCoord.xy).xyz)*200.0);\n\n    // diffuseCoef = vec3( decodeDepthRGB(texture2D(tShadowMap'+
(obj.shadowIndex)+
',fragCoord.xy).xyz ) );\n  }\n  ';
 } 
__p+='\n\n\n  LS_DIFFUSE    += dContrib * lightContrib;\n  LS_SPECULAR   += sContrib  * lightContrib;\n\n  // specularColor *= 0.0;\n\n}';
return __p;
}