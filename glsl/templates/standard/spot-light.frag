{

  vec3 lightDir= uLSpotPositions[{{@index}}] - vWorldPosition;
  float lightdist = length(lightDir);
  lightDir /= lightdist;

  // falloff
  

  {{= if(obj.infinite){ }}
  float falloff = 1.0 / (lightdist*lightdist);
  {{= } else { }}
  float distFactor = pow( lightdist/uLSpotDirections[{{@index}}].w, 4.0 );
  float falloff = clamp( 1.0 - distFactor, 0.0, 1.0 ) / (lightdist*lightdist);
  {{= } }}

  // cone
  float cd= dot( lightDir, uLSpotDirections[{{@index}}].xyz );
  float angularAttenuation = saturate(cd * uLSpotCone[{{@index}}].x + uLSpotCone[{{@index}}].y);
  angularAttenuation *= angularAttenuation;

  vec3 lightContrib = (falloff * angularAttenuation ) * uLSpotColors[{{@index}}].rgb;


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


  LS_DIFFUSE    += dContrib * lightContrib;
  LS_SPECULAR   += sContrib  * lightContrib;

  // specularColor *= 0.0;

}