
vec3 lightDir= uLSpotPositions[{{index}}] - vWorldPosition;
float invLightDist=inversesqrt(dot(lightDir,lightDir));
lightDir *= invLightDist;

// spot effect
float falloff = saturate( uLSpotFalloff[{{index}}].z / invLightDist );
falloff = 1.0 + falloff * ( uLSpotFalloff[{{index}}].x + uLSpotFalloff[{{index}}].y * falloff );

float s = saturate( dot( lightDir, uLSpotDirections[{{index}}] ) );
s = saturate( uLSpotSpot[{{index}}].y-uLSpotSpot[{{index}}].z * (1.0-s*s) );

vec3 lightContrib = (falloff *s ) * uLSpotColors[{{index}}];




// --------- SPEC
vec3 H = normalize( lightDir + viewDir );
float NoH = sdot( H,worldNormal );
float sContib = specularMul * pow( NoH, roughness );
// -------- DIFFUSE
float dContrib = (1.0/PI) * sdot( lightDir, worldNormal );

{{= if(obj.shadowIndex>-1){ }}
  dContrib *= lightOcclusions.weights[{{shadowIndex}}];
  sContib  *= lightOcclusions.weights[{{shadowIndex}}];
{{= } }}


diffuseCoef   += dContrib * lightContrib;
specularColor += sContib  * lightContrib;