module.exports = function( obj ){
var __t,__p='';
__p+='\n// IBL \n{\n  LS_DIFFUSE  += ComputeIBLDiffuse( inputData.worldNrm );\n  LS_SPECULAR += SpecularIBL( tEnv, worldReflect, brdfData.perceptualRoughness );\n}\n';
return __p;
}