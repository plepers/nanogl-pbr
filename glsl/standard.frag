#pragma SLOT version

#pragma SLOT definitions


#ifndef hasNormals
  #define hasNormals 1
#endif 
#ifndef hasTangents
  #define hasTangents hasNormals
#endif 

#if hasTangents && !hasNormals 
  #pragma error tan but no nrm
  error
#endif


#if !hasTangents && __VERSION__ != 300
  #extension GL_OES_standard_derivatives : enable
#endif 

#pragma SLOT precision

{{ require( "./includes/glsl-compat.frag" )() }}
{{ require( "./includes/pbr-inputs-decl.glsl" )() }}

#pragma SLOT pf


uniform vec3 uCameraPosition;
IN vec3 vWorldPosition;

#if hasNormals
IN mediump vec3 vWorldNormal;
#endif 

#if HAS_normal && hasTangents
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
{{ require( "./includes/normals.glsl" )() }}
{{ require( "./includes/tonemap.glsl" )() }}


// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 spec,float glo )
{
  float dot = glo*glo * pow( 1.0-VoH, 5.0 );
  return( 1.0 - dot )*spec + dot;
}





vec3 ComputeIBLDiffuse( vec3 worldNormal ){
  #if perVertexIrrad
    return vIrradiance;
  #else
    return SampleSH(worldNormal, uSHCoeffs );
  #endif
}


//                MAIN
// ===================

void main( void ){

  #pragma SLOT f

  // struct PbrSurface {
  //   vec3 diffuse;
  //   vec3 specularF0;
  //   float roughness;
  // }
  // PbrSurface surface;
  #pragma SLOT pbrsurface

  //
  #ifdef HAS_vertexColor
  #if HAS_vertexColor
    surface.diffuse *= vertexColor();
  #endif
  #endif

  // -----------
  vec3 worldNormal = COMPUTE_NORMAL();



  // SH Irradiance diffuse coeff
  // -------------

  vec3 diffuseCoef = ComputeIBLDiffuse( worldNormal );


  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( tEnv, worldReflect, surface.roughness );


  #pragma SLOT lightsf


  float NoV = sdot( viewDir, worldNormal );
  specularColor *= F_Schlick( NoV, surface.specularF0, 1.0-surface.roughness );



 
  

  vec3 _emissive = vec3(0.0);
  #if HAS_emissive 
    _emissive += emissive();
  #endif
  #if HAS_emissiveFactor
    _emissive *= emissiveFactor();
  #endif
  



  float _alpha = 1.0;
  #if HAS_alpha
    _alpha *= alpha();
  #endif
  #if HAS_alphaFactor
    _alpha *= alphaFactor();
  #endif


  #if alphaMode( MASK )
    if( _alpha < alphaCutoff() ) discard;
    FragColor.a = 1.0;
  #elif alphaMode( BLEND )
    FragColor.a = _alpha;
  #else
    FragColor.a = 1.0;
  #endif


  vec3 color = diffuseCoef*surface.diffuse + specularColor;


 #if HAS_occlusion
    float _occlusion = occlusion();
    #if HAS_occlusionStrength
      _occlusion = 1.0 - occlusionStrength() + _occlusion*occlusionStrength();
    #endif
    color *= _occlusion;
  #endif


  FragColor.xyz = _emissive + color;

  EXPOSURE(FragColor.rgb);
  GAMMA_CORRECTION(FragColor.rgb);




  // FragColor.a = 1.0;

  // FragColor.rgb = FragColor.rgb*0.0001 + gloss();
  // FragColor.rgb = FragColor.rgb*0.0001 + surface.specularF0;
  // FragColor.rgb = FragColor.rgb*0.0001 + specularColor;
  // FragColor.rgb = FragColor.rgb*0.0001 + albedo();
  // FragColor.rgb = FragColor.rgb*0.0001 + albedoSq;
  // FragColor.rgb = FragColor.rgb*0.0001 + diffuseCoef;
  // FragColor.rgb = FragColor.rgb*0.0001 + worldNormal;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldNormal;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldBitangent;
  // FragColor.rgb = FragColor.rgb*0.0001 + vWorldTangent;
  // FragColor.rgb = FragColor.rgb*0.0001 + vec3(1.0, 0.0, 0.0);
  // FragColor.rg = vec2(0.0);

  // pure mirror

  // vec3 _rr = reflect( -viewDir, vWorldNormal );
  // vec3 purerefl = SpecularIBL( tEnv, _rr, 0.0 );
  // FragColor.rgb = FragColor.rgb*0.0001 + purerefl;

  #if HAS_normal
  // FragColor.rgb = FragColor.rgb*0.0001 + normal();
  #endif

  #if HAS_occlusion
    // FragColor.rgb = FragColor.rgb*0.0001 + occlusion();
  #endif


  // #ifdef HAS_GI
  // #if HAS_GI
  //   FragColor.rgb = FragColor.rgb*0.0001 + gi;
  // #endif
  // #endif


}