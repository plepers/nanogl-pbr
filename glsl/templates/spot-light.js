module.exports = function( obj ){
var __t,__p='';
__p+='\nvec3 lightDir= uLSpotPositions['+
(obj.index)+
'] - vWorldPosition;\nfloat invLightDist=inversesqrt(dot(lightDir,lightDir));\nlightDir *= invLightDist;\n\n// spot effect\nfloat falloff = saturate( uLSpotFalloff['+
(obj.index)+
'].z / invLightDist );\nfalloff = 1.0 + falloff * ( uLSpotFalloff['+
(obj.index)+
'].x + uLSpotFalloff['+
(obj.index)+
'].y * falloff );\n\nfloat s = saturate( dot( lightDir, uLSpotDirections['+
(obj.index)+
'] ) );\ns = saturate( uLSpotSpot['+
(obj.index)+
'].y-uLSpotSpot['+
(obj.index)+
'].z * (1.0-s*s) );\n\nvec3 lightContrib = (falloff *s ) * uLSpotColors['+
(obj.index)+
'];\n\n\n\n\n// --------- SPEC\nvec3 H = normalize( lightDir + viewDir );\nfloat NoH = sdot( H,worldNormal );\nfloat sContib = specularMul * pow( NoH, roughness );\n// -------- DIFFUSE\nfloat dContrib = (1.0/PI) * sdot( lightDir, worldNormal );\n\n';
 if(obj.shadowIndex>-1){ 
__p+='\n  dContrib *= lightOcclusions.weights['+
(obj.shadowIndex)+
'];\n  sContib  *= lightOcclusions.weights['+
(obj.shadowIndex)+
'];\n';
 } 
__p+='\n\n\ndiffuseCoef   += dContrib * lightContrib;\nspecularColor += sContib  * lightContrib;';
return __p;
}