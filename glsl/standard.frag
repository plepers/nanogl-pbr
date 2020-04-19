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




struct InputData
{
    vec3  worldPos;
    mediump vec3   worldNrm;
    mediump vec3   viewDir;
};



{{ require( "./includes/math.glsl" )() }}
{{ require( "./includes/color.glsl" )() }}
{{ require( "./includes/normals.glsl" )() }}
{{ require( "./includes/tonemap.glsl" )() }}
{{ require( "./includes/lighting.glsl" )() }}





void InitializeBRDFData(SurfaceData surface, out BRDFData brdf)
{
    mediump float reflectivity = ReflectivitySpecular(surface.specular);
    mediump float oneMinusReflectivity = 1.0 - reflectivity;

    brdf.diffuse = surface.albedo * (vec3(1.0, 1.0, 1.0) - surface.specular);
    brdf.specular = surface.specular;

    brdf.grazingTerm = saturate(surface.smoothness + reflectivity);
    brdf.perceptualRoughness = PerceptualSmoothnessToPerceptualRoughness(surface.smoothness);
    brdf.roughness = max(PerceptualRoughnessToRoughness(brdf.perceptualRoughness), 0.001);
    brdf.roughness2 = brdf.roughness * brdf.roughness;

    brdf.normalizationTerm = brdf.roughness * 4.0 + 2.0;
    brdf.roughness2MinusOne = brdf.roughness2 - 1.0;

// #ifdef _ALPHAPREMULTIPLY_ON
//     outBRDFData.diffuse *= alpha;
//     alpha = alpha * oneMinusReflectivity + reflectivity;
// #endif
}

//                MAIN
// ===================

void main( void ){

  #pragma SLOT f


  SurfaceData surface;
  #pragma SLOT pbrsurface

  #if alphaMode( MASK )
    if( surface.alpha < alphaCutoff() ) discard;
  #endif

  //
  #ifdef HAS_vertexColor
  #if HAS_vertexColor
    surface.albedo *= vertexColor();
  #endif
  #endif



  // -----------


  InputData inputData;
  inputData.worldPos = vWorldPosition;
  inputData.viewDir  = normalize( uCameraPosition - vWorldPosition ); // safe normalize?
  inputData.worldNrm = normalize(COMPUTE_NORMAL());
  // inputData.vertexLighting = input.fogFactorAndVertexLight.yzw;


  BRDFData brdfData;
  InitializeBRDFData( surface, brdfData );


  // used by IBL reflexion
  // --------------
  vec3 worldReflect = reflect( -inputData.viewDir, inputData.worldNrm );
  float NoV = sdot( inputData.viewDir, inputData.worldNrm );


  vec3 diffuseContrib = vec3(0.0);
  vec3 specularContrib = vec3(0.0);

  vec3 color = vec3(0.0);

  #define LS_SPECULAR specularContrib
  #define LS_DIFFUSE  diffuseContrib

  #pragma SLOT lightsf

  // todo: apply this only to ibl contrib
  // add proper Fresnel to ponctual lights
  specularContrib *= F_Schlick( NoV, brdfData.specular, surface.smoothness );
  color += surface.occlusion * (diffuseContrib*brdfData.diffuse + specularContrib);


  color += surface.emission;




  #if alphaMode( MASK )
    FragColor.a = 1.0;
  #elif alphaMode( BLEND )
    FragColor.a = surface.alpha;
  #else
    FragColor.a = 1.0;
  #endif


//   vec3 color = diffuseContrib*surface.albedo + specularContrib;


//  #if HAS_occlusion
//     float _occlusion = occlusion();
//     #if HAS_occlusionStrength
//       _occlusion = 1.0 - occlusionStrength() + _occlusion*occlusionStrength();
//     #endif
//     color *= _occlusion;
//   #endif


  FragColor.rgb = color;




  EXPOSURE(FragColor.rgb);


// #if HAS_normal && hasTangents
  // vec3 nrmnn = inputData.worldNrm;
  // nrmnn.z *= -1.0;
  // nrmnn = nrmnn * .5 + .5;
  // FragColor.rgb = FragColor.rgb*0.0001 + nrmnn ;
// #endif
  // FragColor.rgb = FragColor.rgb*0.0001 + surface.smoothness;
  // FragColor.rgb = FragColor.rgb*0.0001 + surface.specular;
  // FragColor.rgb = FragColor.rgb*0.0001 + brdfData.diffuse;


  GAMMA_CORRECTION(FragColor.rgb);

  // FragColor.rgb = FragColor.rgb*0.0001 + inputData.worldNrm ;



  // FragColor.a = 1.0;

  // FragColor.rgb = FragColor.rgb*0.0001 + color;
  // #ifdef HAS_specular
  // #if HAS_specular
  //   FragColor.rgb = FragColor.rgb*0.0001 + specular();
  // #endif
  // #endif
  // FragColor.rgb = FragColor.rgb*0.0001 + surface.smoothness;
  // FragColor.rgb = FragColor.rgb*0.0001 + specularContrib;
  // FragColor.rgb = FragColor.rgb*0.0001 + albedo();
  // FragColor.rgb = FragColor.rgb*0.0001 + albedoSq;
  // FragColor.rgb = FragColor.rgb*0.0001 + diffuseContrib;
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