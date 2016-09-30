#pragma SLOT pv

attribute vec3 aPosition;

uniform mat4 uMVP;



#if depthFormat( D_RGB )
  varying vec2 fragZW;
#endif


void main(void){
  gl_Position = uMVP * vec4( aPosition, 1.0 );

  #if depthFormat( D_RGB )
    fragZW=gl_Position.zw;
  #endif
}
