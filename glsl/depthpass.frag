#pragma SLOT version

#pragma SLOT definitions

#pragma SLOT precision

{{ require( "./includes/glsl-compat.frag" )() }}

#pragma SLOT pf


#if depthFormat( D_RGB )
  IN vec2 fragZW;

  vec3 encodeDepthRGB(float depth){
    vec4 c = vec4(1.0,255.0,65025.0,16581375.0)*depth;
    c=fract(c);
    c.xyz-=c.yzw*(1.0/255.0);
    return c.xyz;
  }
#endif



void main(void){

  #if depthFormat( D_RGB )
    gl_FragColor.xyz = encodeDepthRGB( ( fragZW.x / fragZW.y ) * 0.5 + 0.5 );
    gl_FragColor.w=0.0;
  #endif

  #if depthFormat( D_DEPTH )
    gl_FragColor = vec4( 0.0 );
  #endif

}
