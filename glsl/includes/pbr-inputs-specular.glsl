
// specular

{
  surface.albedo = vec3(1.0);
  #if HAS_diffuse
    surface.albedo *= diffuse();
    // surface.albedo *= diffuse()*diffuse();
  #endif
  #if HAS_diffuseFactor
    surface.albedo *= diffuseFactor();
  #endif


  surface.alpha = 1.0;
  #if HAS_alpha
    surface.alpha *= alpha();
  #endif
  #if HAS_alphaFactor
    surface.alpha *= alphaFactor();
  #endif


  surface.specular = vec3(1.0);
  #if HAS_specular
    surface.specular *= specular();
    // surface.specular *= specular()*specular();
    // surface.specular *= specular();
  #endif
  #if HAS_specularFactor
    surface.specular *= specularFactor();
  #endif


  surface.smoothness = 1.0;
  #if HAS_glossiness
    surface.smoothness *= glossiness();
  #endif
  #if HAS_glossinessFactor
    surface.smoothness *= glossinessFactor();
  #endif


  #if HAS_occlusion
    float _occlusion = occlusion();
    #if HAS_occlusionStrength
      _occlusion = 1.0 - occlusionStrength() + _occlusion*occlusionStrength();
    #endif
    surface.occlusion = _occlusion;
  #else
  surface.occlusion = 1.0;
  #endif



  surface.emission = vec3(0.0);
  #if HAS_emissive 
    surface.emission += emissive();
    #if HAS_emissiveFactor
        surface.emission *= emissiveFactor();
    #endif
  #elif HAS_emissiveFactor
    surface.emission = emissiveFactor();
  #endif
  
}