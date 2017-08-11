{

  vec3 lightDir= uLSpotPositions[{{@index}}] - vWorldPosition;
  float invLightDist=inversesqrt(dot(lightDir,lightDir));
  lightDir *= invLightDist;

  // spot effect
  float falloff = saturate( uLSpotFalloff[{{@index}}].z / invLightDist );
  falloff = 1.0 + falloff * ( uLSpotFalloff[{{@index}}].x + uLSpotFalloff[{{@index}}].y * falloff );

  float s = saturate( dot( lightDir, uLSpotDirections[{{@index}}] ) );
  s = saturate( uLSpotSpot[{{@index}}].x-uLSpotSpot[{{@index}}].y * (1.0-s*s) );

  vec3 lightContrib = (falloff *s ) * uLSpotColors[{{@index}}].rgb;


  // --------- SPEC
  vec3 H = normalize( lightDir + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContrib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );

  {{= if(obj.shadowIndex>-1){ }}
  {
    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector[{{@shadowIndex}}], uShadowMatrices[{{@shadowIndex}}] , vWorldPosition, worldNormal, uShadowMapSize[{{@shadowIndex}}].y );
    float shOccl = calcLightOcclusions(tShadowMap{{@shadowIndex}},fragCoord,uShadowMapSize[{{@shadowIndex}}]);
    dContrib *= shOccl;
    sContrib  *= shOccl;

    #if iblShadowing
      float sDamp = uLSpotColors[{{@index}}].a;
      specularColor *= mix( sDamp, 1.0, shOccl );
    #endif

    // sContrib = sin( decodeDepthRGB(texture2D(tShadowMap{{@shadowIndex}},fragCoord.xy).xyz)*200.0);
    // dContrib = sin( decodeDepthRGB(texture2D(tShadowMap{{@shadowIndex}},fragCoord.xy).xyz)*200.0);

    // diffuseCoef = vec3( decodeDepthRGB(texture2D(tShadowMap{{@shadowIndex}},fragCoord.xy).xyz ) );
  }
  {{= } }}


  diffuseCoef   += dContrib * lightContrib;
  LS_SPECULAR   += sContrib  * lightContrib;

  // specularColor *= 0.0;

}