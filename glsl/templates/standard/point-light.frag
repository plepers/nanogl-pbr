{

  vec3 lightDir= uLPointPositions[{{@index}}] - vWorldPosition;
  float invLightDist=inversesqrt(dot(lightDir,lightDir));
  lightDir *= invLightDist;

  // spot effect
  float falloff = saturate( uLPointFalloff[{{@index}}].z / invLightDist );
  falloff = 1.0 + falloff * ( uLPointFalloff[{{@index}}].x + uLPointFalloff[{{@index}}].y * falloff );

  vec3 lightContrib = falloff * uLPointColors[{{@index}}].rgb;


  // --------- SPEC
  vec3 H = normalize( lightDir + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContrib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );

  diffuseCoef   += dContrib * lightContrib;
  LS_SPECULAR   += sContrib  * lightContrib;

  // specularColor *= 0.0;

}