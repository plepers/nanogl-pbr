

  // mat.roughness = new Input( 'roughness', 1 )
  // mat.alpha     = new Input( 'alpha', 1 );

  // mat.roughness.sampler( texture, 0, 'g' )
  // mat.roughness.sampler( texture, 0, 'r' )


  #ifndef TEX_ID_XXX
    uniform sampler2D tTexXXX;
  #endif


  void main( void ){

    #ifndef TEX_ID_XXX_0
      #define TEX_ID_XXX_0
      vec4 tTexXXX_value = texture2D( tTexXXX, vTexCoord0 );
    #endif

    #define roughness(x) tTexXXX_value.g


    #ifndef TEX_ID_XXX_0
      #define TEX_ID_XXX_0
      vec4 tTexXXX_value = texture2D( tTexXXX, vTexCoord0 );
    #endif

    #define alpha(x) tTexXXX_value.r


  }