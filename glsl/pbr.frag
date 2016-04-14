#pragma PRECODE


uniform vec3 uCameraPosition;


varying vec2 vTexCoord;
varying vec3 vWorldPosition;

varying mediump vec3 vWorldNormal;
varying mediump vec3 vWorldTangent;
varying mediump vec3 vWorldBitangent;

// tmp
#ifdef P_ROUGHNESS_TEX
  uniform sampler2D tRoughness;
#else
  uniform float uRoughness;
#endif

#ifdef P_SPECULAR_TEX
  uniform sampler2D tSpecular;
#else
  uniform vec3 uSpecular;
#endif

#ifdef P_ALBEDO_TEX
  uniform sampler2D tAlbedo;
#else
  uniform vec3 uAlbedo;
#endif

#ifdef P_NORMAL_TEX
  uniform sampler2D tNormal;
#endif

#ifdef P_AO_TEX
  uniform sampler2D tOcclusion;
#endif

uniform vec3 uFresnel;






// IBL
// ---------

uniform vec4 uSHCoeffs[7];
uniform sampler2D tEnv;
uniform float uEnvExpo;


// MATH
// =========

#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// ================================
// compute Spherical Harmonics
// ================================
//
// "Stupid Spherical Harmonics (SH) Tricks"
// http://www.ppsloan.org/publications/StupidSH36.pdf
//
//
vec3 SampleSH( vec3 Normal, vec4 shCoefs[7] )
{
  Normal.xz = Normal.zx;
  vec4 NormalVector = vec4(Normal, 1.0);

  // todo transpose coeffs directly
  // NormalVector.xyz = NormalVector.zyx;

  vec3 X0, X1, X2;
  X0.x = dot( shCoefs[0].xyz, Normal) + shCoefs[0].w;
  X0.y = dot( shCoefs[1].xyz, Normal) + shCoefs[1].w;
  X0.z = dot( shCoefs[2].xyz, Normal) + shCoefs[2].w;

  vec4 vB = NormalVector.zyxx * NormalVector.yxxz;
  X1.x = dot( shCoefs[3].xyz, vB.xyz) + (shCoefs[3].w * vB.w);
  X1.y = dot( shCoefs[4].xyz, vB.xyz) + (shCoefs[4].w * vB.w);
  X1.z = dot( shCoefs[5].xyz, vB.xyz) + (shCoefs[5].w * vB.w);

  float vC = NormalVector.z * NormalVector.z - NormalVector.y * NormalVector.y;
  X2 =  shCoefs[6].xyz * vC;

  return ( X0 + X1 + X2 ) * uEnvExpo;
//  return max( vec3(0.0) , X0 + X1 + X2 );
}


// ================================
// Image Based rough reflexion
// ================================

vec3 decodeRGBE( vec4 hdr ){
  return hdr.rgb * pow( 2.0, (hdr.a*255.0)-128.0 );
}

vec2 float32x3_to_octsplit(in vec3 v) {
  // Project the sphere onto the octahedron, and then onto the xy plane
  vec2 p = v.xz / ( abs(v.x) + abs(v.y) + abs(v.z) );
  p = vec2( p.x+p.y-1.0, p.x-p.y );
  p.x *= sign( v.y );
  return p;
}

vec3 SpecularIBL( vec3 skyUV, float roughness)
{

  vec2 P = float32x3_to_octsplit( skyUV );

  P = vec2(
    0.25*(254.0/256.0),
    0.125*0.5*(254.0/256.0)
    ) * P + vec2(0.5,0.125*0.5);



  float Q=fract(7.0*roughness);
  P.y+=0.125*(7.0*roughness-Q);
  vec2 R=P+vec2(0.0,0.125);

  return uEnvExpo * mix(
    decodeRGBE( texture2D(tEnv,P) ),
    decodeRGBE( texture2D(tEnv,R) ),
    Q
  );
  // return decodeRGBE( texture2D(tEnv,P) );

}



vec3 F_Schlick( float VoH,vec3 specular,float roughness, vec3 fresnel)
{
  float dot = 1.0-VoH;
  dot = dot*dot*dot*dot*dot;
  dot *= roughness*roughness;
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

  // tmp static params

  #ifdef P_ROUGHNESS_TEX
    float roughness = 1.0 - texture2D( tRoughness, vTexCoord ).r;
  #else
    float roughness = uRoughness;
  #endif

  #ifdef P_SPECULAR_TEX
    vec3 specular = texture2D( tSpecular, vTexCoord ).rgb;
    specular = specular*specular;
  #else
    vec3 specular = uSpecular;
  #endif

  #ifdef P_ALBEDO_TEX
    vec3 albedo   = texture2D( tAlbedo, vTexCoord ).rgb;
    albedo = albedo*albedo;
  #else
    vec3 albedo   = uAlbedo;
  #endif

  vec3 fresnel  = uFresnel;


  // -----------

  #ifdef P_NORMAL_TEX
    vec3 nrmTex = texture2D( tNormal, vTexCoord ).rgb;
    vec3 worldNormal = perturbWorldNormal( nrmTex );
  #else
    vec3 worldNormal = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
  #endif

  // SH diffuse coeff
  // -------------
  vec3 diffuseCoef=SampleSH(worldNormal, uSHCoeffs );


  #ifdef P_AO_TEX
    diffuseCoef *= texture2D( tOcclusion, vTexCoord ).r;
  #endif

  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( worldReflect, roughness);

  float NoV = sdot( viewDir, worldNormal );
  specularColor *= F_Schlick( NoV, specular, 1.0-roughness, fresnel );



  gl_FragColor.xyz = toneMap( diffuseCoef*albedo + specularColor );
  // gl_FragColor.xyz= specularColor;




}