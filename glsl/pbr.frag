// #extension GL_OES_standard_derivatives : enable


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
  #if useDerivatives == 0
  IN mediump vec3 vWorldTangent;
  IN mediump vec3 vWorldBitangent;
  #endif
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

{{ require( "./includes/perturb-normal.glsl" )() }}

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
// COMMON METHOD INCLUDE IN EXTERNAL FILE
// #if useDerivatives
// vec3 perturbWorldNormal( vec3 n ){
//   // compute derivations of the world position
//   n = 2.0 * n - 1.0;

//   vec3 nrm = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
//   nrm = normalize( nrm );

//   vec3 p_dx = dFdx(vWorldPosition);
//   vec3 p_dy = dFdy(vWorldPosition);
//   // compute derivations of the texture coordinate
//   vec2 tc_dx = dFdx(vTexCoord);
//   vec2 tc_dy = dFdy(vTexCoord);

//   float r = 1.0 / (tc_dx.x * tc_dy.y - tc_dx.y * tc_dy.x);

//   // compute initial tangent and bi-tangent
//   vec3 t = normalize( tc_dy.y * p_dx - tc_dx.y * p_dy )*r;
//   vec3 b = normalize( tc_dx.x * p_dy - tc_dy.x * p_dx )*r;

//   // get new tangent from a given world normal
//   vec3 x = cross(nrm, t);
//   t = cross(x, nrm);
//   t = normalize(t);
//   // get updated bi-tangent
//   x = cross(b, nrm);
//   b = cross(nrm, x);
//   b = normalize(b);
//   mat3 tbn = mat3(t, b, nrm);
//   return tbn * n;
// }
// #elif HAS_normal
// vec3 perturbWorldNormal(vec3 n){
//   n = 2.0*n - 1.0;
//   vec3 nrm = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
//   return normalize(vWorldTangent * n.x + vWorldBitangent*n.y + nrm * n.z );
// }
// #endif


//                MAIN
// ===================

void main( void ){

  #pragma SLOT f

  // -----------
  vec3 nrm = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
  vec3 worldNormal =
    #if HAS_normal
      perturbWorldNormal( nrm, normal() );
    #else
      nrm;
    #endif
  worldNormal = normalize( worldNormal );


  // SH Irradiance diffuse coeff
  // -------------
  #if perVertexIrrad
    vec3 diffuseCoef = vIrradiance;
  #else
    vec3 diffuseCoef = SampleSH(worldNormal, uSHCoeffs );
  #endif



  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( tEnv, worldReflect, 1.0-gloss() );


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
    #ifndef cavityStrength
      #define cavityStrength(k) vec2(1.0)
    #endif
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



  FragColor.xyz = diffuseCoef*albedoSq + specularColor;


  #if HAS_exposure
    FragColor.xyz *= vec3( exposure() );
  #endif


  #if gammaMode( GAMMA_STD ) && HAS_gamma
    FragColor.xyz = pow( FragColor.xyz, vec3( gamma() ) );
  #endif

  #if gammaMode( GAMMA_2_2 )
    FragColor.xyz = pow( FragColor.xyz, vec3( 1.0/2.2 ) );
  #endif

  #if gammaMode( GAMMA_TB )
    {
      vec3 c = FragColor.xyz;
      vec3 sqrtc = sqrt( c );
      FragColor.xyz = (sqrtc-sqrtc*c) + c*(0.4672*c+vec3(0.5328));
    }
  #endif

  #if gammaMode( GAMMA_TB )
    {
      vec3 c = FragColor.xyz;
      vec3 sqrtc = sqrt( c );
      FragColor.xyz = (sqrtc-sqrtc*c) + c*(0.4672*c+vec3(0.5328));
    }
  #endif




  FragColor.a = 1.0;



  FragColor.a = 1.0;

}