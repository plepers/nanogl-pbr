#if __VERSION__ == 300
  #define IN in
  #define texture2D(a,b) texture( a, b )
#else
  #define IN varying
  #define FragColor gl_FragColor
#endif

#if __VERSION__ == 300
  out vec4 FragColor;
#endif