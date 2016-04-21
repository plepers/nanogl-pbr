#define NUM_S_LIGHTS 2
#define NUM_D_LIGHTS 1
#define NUM_LIGHTS NUM_D_LIGHTS+NUM_D_LIGHTS

uniform vec2 uLightPositions  [NUM_S_LIGHTS];
uniform vec3 uLightParams     [NUM_S_LIGHTS];
uniform vec3 uLightSpot       [NUM_S_LIGHTS];

uniform vec3 uLightDirections [NUM_LIGHTS];
uniform vec3 uLightColors     [NUM_LIGHTS];


vec3 spotLightContrib( LightData light, vec3 lightDir, float invLightDist ){


  float falloff = saturate( light.invDist / invLightDist );
  falloff = 1.0 + falloff * ( light.curveFactors.x + light.curveFactors.y*falloff );

  float s = saturate( dot( lightDir, light.direction ) );
  s = saturate( light.spotFactors.x-light.spotFactors.y * (1.0-s*s) );

  return (falloff *s ) * light.color.xyz;
}


void LIGHT( )

void SPOT( void ){



    // SPOT
    // ====
    for( int i=0; i<NUM_S_LIGHTS;i++){

      // IF SPOT
      vec3 lightDir= uLightPositions[o] - vWorldPosition;
      float invLightDist=inversesqrt(dot(lightDir,lightDir));
      lightDir *= invLightDist;

      // spot effect
      float falloff = saturate( uLightParams[o].z / invLightDist );
      falloff = 1.0 + falloff * ( uLightParams[o].x + uLightParams[o].y * falloff );

      float s = saturate( dot( lightDir, uLightDirections[o] ) );
      s = saturate( uLightSpot[o].y-uLightSpot[o].z * (1.0-s*s) );

      vec3 lightContrib = (falloff *s ) * uLightColors[o];




      // --------- SPEC
      vec3 H = normalize( lightDir + viewDir );
      float NoH = sdot( H,worldNormal );
      float sContib = specularMul * pow( NoH, roughness );
      // -------- DIFFUSE
      float dContrib = (1.0/PI) * sdot( lightDir, worldNormal );

      #ifdef SHADOW
        sContib*=lightOcclusions.weights[o];
        dContrib*=lightOcclusions.weights[o];
      #endif

      diffuseCoef   += dContrib * lightContrib;
      specularColor += sContib  * lightContrib;

    }




    // DIRECTIONAL
    // ===========
    for( int i=NUM_S_LIGHTS; i<NUM_LIGHTS;i++){

      // --------- SPEC
      vec3 H = normalize( uLightDirections[o] + viewDir );
      float NoH = sdot( H,worldNormal );
      float sContib = specularMul * pow( NoH, roughness );
      // -------- DIFFUSE
      float dContrib = (1.0/PI) * sdot( uLightDirections[o] ,worldNormal );


      #ifdef SHADOW_COUNT
        dContrib *= lightOcclusions.weights[o];
        sContib  *= lightOcclusions.weights[o];
      #endif


      diffuseCoef   += dContrib * uLightColors[o];
      specularColor += sContib  * uLightColors[o];

    }
    

}