
highp float roughness = -10.0 / log2( gloss()*0.968+0.03 );
roughness *= roughness;
float specularMul = roughness * (0.125/3.141592) + 0.5/3.141592;


vec3 lSpecularColor = vec3(0.0);
#define LS_SPECULAR lSpecularColor