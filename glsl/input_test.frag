precision highp float;

#define GLSLIFY 1
uniform sampler2D tAlbedo;
uniform sampler2D tSpecular;
uniform sampler2D tGloss;
uniform sampler2D tNormal;
uniform sampler2D tOcclusion;
uniform vec3 uFresnel;
#define HAS_albedo 1
#define albedo(k) VAL_tAlbedovTexCoord.rgb
#define HAS_specular 1
#define specular(k) VAL_tSpecularvTexCoord.rgb
#define HAS_gloss 1
#define gloss(k) VAL_tGlossvTexCoord.r
#define HAS_normal 1
#define normal(k) VAL_tNormalvTexCoord.rgb
#define HAS_occlusion 1
#define occlusion(k) VAL_tOcclusionvTexCoord.r
#define HAS_fresnel 1
#define fresnel(k) uFresnel.rgb


uniform vec3 uCameraPosition;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;

varying mediump vec3 vWorldNormal;
varying mediump vec3 vWorldTangent;
varying mediump vec3 vWorldBitangent;

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

  vec4 VAL_tAlbedovTexCoord = texture2D( tAlbedo, vTexCoord);
vec4 VAL_tSpecularvTexCoord = texture2D( tSpecular, vTexCoord);
vec4 VAL_tGlossvTexCoord = texture2D( tGloss, vTexCoord);
vec4 VAL_tNormalvTexCoord = texture2D( tNormal, vTexCoord);
vec4 VAL_tOcclusionvTexCoord = texture2D( tOcclusion, vTexCoord);


  // albedo
  // specular
  // gloss
  // normal
  // occlusion
  // fresnel


  // -----------

  #if HAS_normal
    vec3 worldNormal = perturbWorldNormal( normal() );
  #else
    vec3 worldNormal = gl_FrontFacing ? vWorldNormal : -vWorldNormal;
  #endif

  // SH diffuse coeff
  // -------------
  vec3 diffuseCoef=SampleSH(worldNormal, uSHCoeffs );

  #ifdef HAS_occlusion
    diffuseCoef *= occlusion();
  #endif

  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( worldReflect, gloss() );

  float NoV = sdot( viewDir, worldNormal );
  vec3 specularSq = specular()*specular();
  specularColor *= F_Schlick( NoV, specularSq, 1.0-gloss() , fresnel() );

  vec3 albedoSq = albedo()*albedo();
  gl_FragColor.xyz = toneMap( diffuseCoef*albedoSq + specularColor );
  // gl_FragColor.xyz= specularColor;

}