



// #pragma Input vec3 normal
// #pragma Enum ibl_type { NONE, SH7, SH9 }

#if __VERSION__ == 300
  #define IN in
  out vec4 FragColor;
  #define texture2D(a,b) texture( a, b )
#else
  #define IN varying
  #define FragColor gl_FragColor
#endif


uniform vec3 uCameraPosition;

IN vec2 vTexCoord;
IN vec3 vWorldPosition;

IN mediump vec3 vWorldNormal;

#pragma SLOT pf

#if HAS_normal
  IN mediump vec3 vWorldTangent;
  IN mediump vec3 vWorldBitangent;
#endif



// IBL
// ========
uniform sampler2D tEnv;

#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec4 uSHCoeffs[7];
  {{ require( "./includes/spherical-harmonics.glsl" )() }}
#endif



// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// INCLUDES
// =========

{{ require( "./includes/ibl.glsl" )() }}



// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 spec,float glo )
{
  float dot = glo*glo * pow( 1.0-VoH, 5.0 );
  #if HAS_fresnel
    return( 1.0 - dot )*spec + dot*fresnel();
  #else
    return( 1.0 - dot )*spec + dot;
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


  // SH Irradiance diffuse coeff
  // -------------
  #if perVertexIrrad
    vec3 diffuseCoef = vIrradiance;
  #else
    vec3 diffuseCoef=SampleSH(worldNormal, uSHCoeffs );
    #if HAS_iblExpo
      diffuseCoef = iblExpo().x * pow( diffuseCoef, vec3( iblExpo().y ) );
    #endif
  #endif



  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( tEnv, worldReflect, 1.0-gloss() );
  #if HAS_iblExpo
    specularColor = iblExpo().x * pow( specularColor, vec3( iblExpo().y ) );
  #endif


  #pragma SLOT lightsf


  float NoV = sdot( viewDir, worldNormal );
  vec3 specularSq = specular()*specular();
  specularColor *= F_Schlick( NoV, specularSq, gloss() );


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


  #if HAS_emissive
    float e = emissive();
    #if HAS_emissiveScale
      e = e * emissiveScale();
    #endif
    diffuseCoef += vec3( e ) * albedo();
  #endif


  #if tonemap
    FragColor.xyz = toneMap( diffuseCoef*albedoSq + specularColor );
  #else
    FragColor.xyz = diffuseCoef*albedoSq + specularColor;
  #endif

  FragColor.a = 1.0;




}