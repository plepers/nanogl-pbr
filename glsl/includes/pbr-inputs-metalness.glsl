
PbrSurface surface;

{
  
  vec3 _baseColor = vec3(1.0);
  #if HAS_baseColor
    _baseColor *= baseColor()*baseColor();
  #endif
  #if HAS_baseColorFactor
    _baseColor *= baseColorFactor();
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


  surface.diffuse    = (_baseColor * vec3(1.0-0.04) ) * (1.0-_metalness);
  surface.specularF0 = mix( vec3(0.04), _baseColor, _metalness );
  surface.roughness  = _roughness;

}