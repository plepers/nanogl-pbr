module.exports = function( obj ){
var __t,__p='';
__p+='{\n\n  vec3 lightDir= uLPointPositions['+
(obj.index)+
'] - vWorldPosition;\n  float invLightDist=inversesqrt(dot(lightDir,lightDir));\n  lightDir *= invLightDist;\n\n  // spot effect\n  float falloff = saturate( uLPointFalloff['+
(obj.index)+
'].z / invLightDist );\n  falloff = 1.0 + falloff * ( uLPointFalloff['+
(obj.index)+
'].x + uLPointFalloff['+
(obj.index)+
'].y * falloff );\n\n  vec3 lightContrib = falloff * uLPointColors['+
(obj.index)+
'].rgb;\n\n\n  // --------- SPEC\n  vec3 H = normalize( lightDir + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContrib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );\n\n  diffuseCoef   += dContrib * lightContrib;\n  LS_SPECULAR   += sContrib  * lightContrib;\n\n  // specularColor *= 0.0;\n\n}';
return __p;
}