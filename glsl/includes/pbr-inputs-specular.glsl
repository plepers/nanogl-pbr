
// specular
PbrSurface surface;

{
  vec3 _diffuse = vec3(1.0);
  #if HAS_diffuse
    _diffuse *= diffuse()*diffuse();
  #endif
  #if HAS_diffuseFactor
    _diffuse *= diffuseFactor();
  #endif

  vec3 _specular = vec3(1.0);
  #if HAS_specular
    _specular *= specular()*specular();
  #endif
  #if HAS_specularFactor
    _specular *= specularFactor();
  #endif



  float _glossiness = 1.0;
  #if HAS_glossiness
    _glossiness *= glossiness();
  #endif
  #if HAS_glossinessFactor
    _glossiness *= glossinessFactor();
  #endif

  float p_roughness = 1.0-_glossiness;

  surface.diffuse    = _diffuse * (1.0 - max(_specular.r, max(_specular.g, _specular.b)));
  surface.specularF0 = _specular;
  surface.roughness  = p_roughness;
}