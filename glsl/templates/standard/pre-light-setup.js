module.exports = function( obj ){
var __t,__p='';
__p+='\nhighp float roughness = -10.0 / log2( gloss()*0.968+0.03 );\nroughness *= roughness;\nfloat specularMul = roughness * (0.125/3.141592) + 0.5/3.141592;\n\n\nvec3 lSpecularColor = vec3(0.0);\n#define LS_SPECULAR lSpecularColor';
return __p;
}