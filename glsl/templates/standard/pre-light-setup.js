module.exports = function( obj ){
var __t,__p='';
__p+='\nhighp float roughness = -10.0 / log2( (1.0-surface.roughness)*0.968+0.03 );\nroughness *= roughness;\nfloat specularMul = roughness * (0.125/3.141592) + 0.5/3.141592;\n';
return __p;
}