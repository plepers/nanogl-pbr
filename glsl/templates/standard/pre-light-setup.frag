
highp float roughness = -10.0 / log2( (1.0-surface.roughness)*0.968+0.03 );
roughness *= roughness;
float specularMul = roughness * (0.125/3.141592) + 0.5/3.141592;
