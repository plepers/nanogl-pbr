



// #pragma Input vec3 normal
// #pragma Enum ibl_type { NONE, SH7, SH9 }



uniform vec3 uCameraPosition;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;

varying mediump vec3 vWorldNormal;

#pragma SLOT pf

#if HAS_normal
  varying mediump vec3 vWorldTangent;
  varying mediump vec3 vWorldBitangent;
#endif



// IBL
// ========
uniform vec4 uSHCoeffs[7];
uniform sampler2D tEnv;
uniform vec2 uEnvTonemap;


// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// INCLUDES
// =========
#pragma glslify: SampleSH    = require( ./includes/spherical-harmonics.glsl )
#pragma glslify: SpecularIBL = require( ./includes/ibl.glsl )



// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 specular,float gloss )
{
  float dot = 1.0-VoH;
  dot = dot*dot*dot*dot*dot;
  dot *= gloss*gloss;
  #if HAS_fresnel
    return( 1.0 - dot )*specular + dot*fresnel();
  #else
    return( 1.0 - dot )*specular + dot;
  #endif
}


// ------------------------------
//

#if HAS_normal
vec3 perturbWorldNormal(vec3 n){
  n = 2.0*n - 1.0;
  vec3 nrm = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
  return normalize(vWorldTangent * n.x + vWorldBitangent*n.y + nrm * n.z );
}
#endif


// ------------------------------
//
vec3 toneMap(vec3 c){
  vec3 sqrtc = sqrt( c );
  return(sqrtc-sqrtc*c) + c*(0.4672*c+vec3(0.5328));
}

//                MAIN
// ===================

void main( void ){

  #pragma SLOT f


  // -----------
  vec3 worldNormal =
    #if HAS_normal
      perturbWorldNormal( normal() );
    #else
      gl_FrontFacing ? vWorldNormal : -vWorldNormal;
    #endif
  worldNormal = normalize( worldNormal );

  // SH diffuse coeff
  // -------------
  vec3 diffuseCoef=SampleSH(worldNormal, uSHCoeffs );
  #if HAS_iblExpo
    diffuseCoef = iblExpo().x * pow( diffuseCoef, vec3( iblExpo().y ) );
  #endif



  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( tEnv, worldReflect, 1.0-gloss() );
  #if HAS_iblExpo
    specularColor = iblExpo().x * pow( specularColor, vec3( iblExpo().y ) );
  #endif

  float NoV = sdot( viewDir, worldNormal );
  vec3 specularSq = specular()*specular();
  specularColor *= F_Schlick( NoV, specularSq, gloss() );


  #pragma SLOT lightsf


  vec3 alb = albedo();
  #if conserveEnergy
    alb = alb - alb * specular();
  #endif
  vec3 albedoSq = alb*alb;



  #if HAS_occlusion
    diffuseCoef *= occlusion();
  #endif

  #if HAS_cavity
    diffuseCoef   *= cavity() * cavityStrength().r + (1.0-cavityStrength().r);
    specularColor *= cavity() * cavityStrength().g + (1.0-cavityStrength().g);
  #endif



  gl_FragColor.xyz = toneMap( diffuseCoef*albedoSq + specularColor );




}