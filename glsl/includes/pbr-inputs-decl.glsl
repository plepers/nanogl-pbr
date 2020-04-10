

struct PbrSurface {
  vec3 diffuse;
  vec3 specularF0;
  float roughness;
};

#define DefaultPbrSurface PbrSurface(vec3(0.0), vec3(0.04), 0.0)