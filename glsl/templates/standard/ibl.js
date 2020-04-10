module.exports = function( obj ){
var __t,__p='';
__p+='\n// IBL \n{\n  LS_DIFFUSE  += ComputeIBLDiffuse( worldNormal );\n  LS_SPECULAR += SpecularIBL( tEnv, worldReflect, surface.roughness );\n}\n';
return __p;
}