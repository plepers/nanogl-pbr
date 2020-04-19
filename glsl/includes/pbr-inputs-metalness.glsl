
{
  
  vec3 _baseColor = vec3(1.0);
  #if HAS_baseColor
    _baseColor *= FastSRGBToLinear( baseColor() );
    // _baseColor *= baseColor()*baseColor();
  #endif
  #if HAS_baseColorFactor
    _baseColor *= baseColorFactor();
  #endif

  
  surface.alpha = 1.0;
  #if HAS_alpha
    surface.alpha *= alpha();
  #endif
  #if HAS_alphaFactor
    surface.alpha *= alphaFactor();
  #endif


  float _metalness = 1.0;
  #if HAS_metalness
    _metalness *= metalness();
  #endif
  #if HAS_metalnessFactor
    _metalness *= metalnessFactor();
  #endif


  float _roughness = 1.0;
  #if HAS_roughness
    _roughness *= roughness();
  #endif
  #if HAS_roughnessFactor
    _roughness *= roughnessFactor();
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
  #endif
  #if HAS_emissiveFactor
    surface.emission *= emissiveFactor();
  #endif

  surface.albedo    = (_baseColor * vec3(1.0-0.04) ) * (1.0-_metalness);
  surface.specular = mix( vec3(0.04), _baseColor, _metalness );
  surface.smoothness  = 1.0-_roughness;

}