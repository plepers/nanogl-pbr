{

  vec3 lightDir= uLPointPositions[{{@index}}].xyz - vWorldPosition;
  float lightdist = length(lightDir);
  lightDir /= lightdist;

  // spot effect

  {{= if(obj.infinite){ }}
  float falloff = 1.0 / (lightdist*lightdist);
  {{= } else { }}
  float distFactor = pow( lightdist/uLPointPositions[{{@index}}].w, 4.0 );
  float falloff = clamp( 1.0 - distFactor, 0.0, 1.0 ) / (lightdist*lightdist);
  {{= } }}

  vec3 lightContrib = falloff * uLPointColors[{{@index}}].rgb;


  // --------- SPEC
  vec3 H = normalize( lightDir + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContrib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( lightDir, worldNormal );

  LS_DIFFUSE    += dContrib  * lightContrib;
  LS_SPECULAR   += sContrib  * lightContrib;

  // specularColor *= 0.0;

}