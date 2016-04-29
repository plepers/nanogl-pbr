precision highp float;

varying vec2 fragZW;

// #ifdef ALPHA_THRESHOLD
//   varying mediump vec2 vTexCoord0;
//   uniform sampler2D tAGT;
// #endif


vec3 encodeDepthRGB(float depth){
  vec4 c = vec4(1.0,255.0,65025.0,16581375.0)*depth;
  c=fract(c);
  c.xyz-=c.yzw*(1.0/255.0);
  return c.xyz;
}

void main(void){

  // #ifdef ALPHA_THRESHOLD
  //   float alpha = texture2D(tAGT,vTexCoord0).r;
  //   if(alpha<0.9){
  //     discard;
  //   }
  // #endif

  gl_FragColor.xyz = encodeDepthRGB( ( fragZW.x / fragZW.y ) * 0.5 + 0.5 );
  gl_FragColor.w=0.0;
}
