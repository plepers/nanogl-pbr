module.exports = function( obj ){
var __t,__p='';
__p+='// --------- SPEC\nvec3 H = normalize( uLDirDirections['+
(obj.index)+
'] + viewDir );\nfloat NoH = sdot( H,worldNormal );\nfloat sContib = specularMul * pow( NoH, roughness );\n// -------- DIFFUSE\nfloat dContrib = (1.0/3.141592) * sdot( uLDirDirections['+
(obj.index)+
'] ,worldNormal );\n\n';
 if(obj.shadowIndex>-1){ 
__p+='\n  dContrib *= lightOcclusions.weights['+
(obj.shadowIndex)+
'];\n  sContib  *= lightOcclusions.weights['+
(obj.shadowIndex)+
'];\n';
 } 
__p+='\n\ndiffuseCoef   += dContrib * uLDirColors['+
(obj.index)+
'];\nspecularColor += sContib  * uLDirColors['+
(obj.index)+
'];\n';
return __p;
}