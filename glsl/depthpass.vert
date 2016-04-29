precision highp float;

attribute vec3 aPosition;
//attribute vec2 aTexCoord0;

uniform mat4 uMVP;

varying vec2 fragZW;

// #ifdef ALPHA_THRESHOLD
//   varying mediump vec2 vTexCoord0;
// #endif


void main(void){
  gl_Position = uMVP * vec4( aPosition, 1.0 );
  fragZW=gl_Position.zw;

  // #ifdef ALPHA_THRESHOLD
  //   vTexCoord0=aTexCoord0;
  // #endif
}
