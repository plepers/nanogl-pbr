
vec3 decodeRGBE( vec4 hdr ){
  return hdr.rgb * pow( 2.0, (hdr.a*255.0)-128.0 );
}


#pragma glslify: export(decodeRGBE)