// --------- SPEC
{

  vec3 H = normalize( uLDirDirections[{{@index}}] + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( uLDirDirections[{{@index}}] ,worldNormal );

  {{= if(obj.shadowIndex>-1){ }}
  {
    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector[{{@shadowIndex}}], uShadowMatrices[{{@shadowIndex}}] , worldNormal, , 4.0/uShadowMapSize[{{@shadowIndex}}].x );
    float shOccl = calcLightOcclusions(tShadowMap{{@shadowIndex}},fragCoord,uShadowMapSize[{{@shadowIndex}}]);
    dContrib *= shOccl;
    sContib  *= shOccl;
  }
  {{= } }}

  diffuseCoef   += dContrib * uLDirColors[{{@index}}];
  specularColor += sContib  * uLDirColors[{{@index}}];

}