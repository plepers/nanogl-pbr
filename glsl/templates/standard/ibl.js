module.exports = function( obj ){
var __t,__p='';
__p+='\r\n// IBL \r\n{\r\n  LS_DIFFUSE  += ComputeIBLDiffuse( inputData.worldNrm );\r\n  LS_SPECULAR += SpecularIBL( tEnv, worldReflect, brdfData.perceptualRoughness );\r\n}\r\n';
return __p;
}