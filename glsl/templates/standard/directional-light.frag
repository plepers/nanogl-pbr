// --------- SPEC
{

  vec3 H = normalize( uLDirDirections[{{@index}}] + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( uLDirDirections[{{@index}}] ,worldNormal );

  {{= if(obj.shadowIndex>-1){ }}
  {
    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector[{{@shadowIndex}}], uShadowMatrices[{{@shadowIndex}}] , vWorldPosition, worldNormal, uShadowMapSize[{{@shadowIndex}}].y );
    float shOccl = calcLightOcclusions(tShadowMap{{@shadowIndex}},fragCoord,uShadowMapSize[{{@shadowIndex}}]);
    dContrib *= shOccl;
    sContib  *= shOccl;
    
    #if iblShadowing
      float sDamp = uLDirColors[{{@index}}].a;
      specularColor *= mix( sDamp, 1.0, shOccl );
    #endif
  }
  {{= } }}

  diffuseCoef   += dContrib * uLDirColors[{{@index}}].rgb;
  LS_SPECULAR   += sContib  * uLDirColors[{{@index}}].rgb;

}