

#ifndef _H_TONEMAP_
#define _H_TONEMAP_


  // Exposure
  // ===========


  #if HAS_exposure
    #define EXPOSURE(color) color *= vec3( exposure() );
  #else
    #define EXPOSURE(color)
  #endif


  // Gamma correction
  // ===========

  #if gammaMode( GAMMA_STD ) && HAS_gamma
    #define GAMMA_CORRECTION(color) color = pow( color, vec3( gamma() ) );


  #elif gammaMode( GAMMA_2_2 )
    #define GAMMA_CORRECTION(color) color = pow( color, vec3( 1.0/2.2 ) );


  #elif gammaMode( GAMMA_TB )

    void ToneMapTB( inout vec3 color ) {
      vec3 c = color;
      vec3 sqrtc = sqrt( c );
      color = (sqrtc-sqrtc*c) + c*(0.4672*c+vec3(0.5328));
    }

    #define GAMMA_CORRECTION(color) ToneMapTB( color );

  #else
    #define GAMMA_CORRECTION(color)

  #endif



#endif