module.exports = function( obj ){
var __t,__p='';
__p+='{\n\n  vec3 lightDir= uLSpotPositions['+
(obj.index)+
'] - vWorldPosition;\n  float invLightDist=inversesqrt(dot(lightDir,lightDir));\n  lightDir *= invLightDist;\n\n  // spot effect\n  float falloff = saturate( uLSpotFalloff['+
(obj.index)+
'].z / invLightDist );\n  falloff = 1.0 + falloff * ( uLSpotFalloff['+
(obj.index)+
'].x + uLSpotFalloff['+
(obj.index)+
'].y * falloff );\n\n  float s = saturate( dot( lightDir, uLSpotDirections['+
(obj.index)+
'] ) );\n  s = saturate( uLSpotSpot['+
(obj.index)+
'].x-uLSpotSpot['+
(obj.index)+
'].y * (1.0-s*s) );\n\n  vec3 lightContrib = (falloff *s ) * uLSpotColors['+
(obj.index)+
'].rgb;\n\n\n  // --------- SPEC\n  vec3 H = normalize( lightDir + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContrib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );\n\n  ';
 if(obj.shadowIndex>-1){ 
__p+='\n  {\n    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector['+
(obj.shadowIndex)+
'], uShadowMatrices['+
(obj.shadowIndex)+
'] , worldNormal, uShadowMapSize['+
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
__p+='\n\n\n  diffuseCoef   += dContrib * lightContrib;\n  LS_SPECULAR   += sContrib  * lightContrib;\n\n  // specularColor *= 0.0;\n\n}';
return __p;
}