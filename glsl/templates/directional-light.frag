// --------- SPEC
vec3 H = normalize( uLDirDirections[{{index}}] + viewDir );
float NoH = sdot( H,worldNormal );
float sContib = specularMul * pow( NoH, roughness );
// -------- DIFFUSE
float dContrib = (1.0/3.141592) * sdot( uLDirDirections[{{index}}] ,worldNormal );

{{= if(obj.shadowIndex>-1){ }}
  dContrib *= lightOcclusions.weights[{{shadowIndex}}];
  sContib  *= lightOcclusions.weights[{{shadowIndex}}];
{{= } }}

diffuseCoef   += dContrib * uLDirColors[{{index}}];
specularColor += sContib  * uLDirColors[{{index}}];
