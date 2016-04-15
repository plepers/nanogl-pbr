#pragma PRECODE

uniform vec3 uCameraPosition;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;

varying mediump vec3 vWorldNormal;
varying mediump vec3 vWorldTangent;
varying mediump vec3 vWorldBitangent;


// IBL
// ========
uniform vec4 uSHCoeffs[7];
uniform sampler2D tEnv;
uniform float uEnvExpo;


// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// INCLUDES
// =========
#pragma glslify: SampleSH    = require( ./includes/spherical-harmonics.glsl )
#pragma glslify: SpecularIBL = require( ./includes/ibl.glsl )



vec3 F_Schlick( float VoH,vec3 specular,float gloss, vec3 fresnel)
{
  float dot = 1.0-VoH;
  dot = dot*dot*dot*dot*dot;
  dot *= gloss*gloss;
  return( specular - dot*specular ) + dot*fresnel;
}


// ------------------------------
//
vec3 perturbWorldNormal(vec3 n){
  n = 2.0*n - 1.0;
  vec3 nrm = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
  return normalize(vWorldTangent * n.x + vWorldBitangent*n.y + nrm * n.z );
}


// ------------------------------
//
vec3 toneMap(vec3 c){
  vec3 sqrtc = sqrt( c );
  return(sqrtc-sqrtc*c) + c*(0.4672*c+vec3(0.5328));
}

//                MAIN
// ===================

void main( void ){

  #pragma CODE


  // -----------
  vec3 worldNormal =
    #if HAS_normal
      perturbWorldNormal( normal() );
    #else
      gl_FrontFacing ? vWorldNormal : -vWorldNormal;
    #endif

  // SH diffuse coeff
  // -------------
  vec3 diffuseCoef=SampleSH(worldNormal, uSHCoeffs );
  diffuseCoef *= uEnvExpo;


  #ifdef HAS_occlusion
    diffuseCoef *= occlusion();
  #endif

  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = uEnvExpo * SpecularIBL( tEnv, worldReflect, 1.0-gloss() );

  float NoV = sdot( viewDir, worldNormal );
  vec3 specularSq = specular()*specular();
  specularColor *= F_Schlick( NoV, specularSq, gloss() , fresnel() );


  vec3 albedoSq = albedo()*albedo();
  gl_FragColor.xyz = toneMap( diffuseCoef*albedoSq + specularColor );
  // gl_FragColor.xyz= specularColor;




}