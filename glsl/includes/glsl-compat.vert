#if __VERSION__ == 300
  #define IN in
  #define OUT out
#else
  #define IN attribute
  #define OUT varying
#endif