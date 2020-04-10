module.exports = function( obj ){
var __t,__p='';
__p+='{\n\n  vec3 lightDir= uLPointPositions['+
(obj.index)+
'].xyz - vWorldPosition;\n  float lightdist = length(lightDir);\n  lightDir /= lightdist;\n\n  // spot effect\n\n  ';
 if(obj.infinite){ 
__p+='\n  float falloff = 1.0 / (lightdist*lightdist);\n  ';
 } else { 
__p+='\n  float distFactor = pow( lightdist/uLPointPositions['+
(obj.index)+
'].w, 4.0 );\n  float falloff = clamp( 1.0 - distFactor, 0.0, 1.0 ) / (lightdist*lightdist);\n  ';
 } 
__p+='\n\n  vec3 lightContrib = falloff * uLPointColors['+
(obj.index)+
'].rgb;\n\n\n  // --------- SPEC\n  vec3 H = normalize( lightDir + viewDir );\n  float NoH = sdot( H,worldNormal );\n  float sContrib = specularMul * pow( NoH, roughness );\n  // -------- DIFFUSE\n  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );\n\n  LS_DIFFUSE    += dContrib  * lightContrib;\n  LS_SPECULAR   += sContrib  * lightContrib;\n\n  // specularColor *= 0.0;\n\n}';
return __p;
}