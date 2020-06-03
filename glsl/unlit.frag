#pragma SLOT version

#pragma SLOT definitions

#pragma SLOT precision

{{ require( "./includes/glsl-compat.frag" )() }}

#pragma SLOT pf



// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )



//                MAIN
// ===================

void main( void ){

  #pragma SLOT f

 vec3 _baseColor = vec3(1.0);
  #if HAS_baseColor
    _baseColor *= baseColor()*baseColor();
  #endif
  #if HAS_baseColorFactor
    _baseColor *= baseColorFactor();
  #endif



  //
  #ifdef HAS_vertexColor
  #if HAS_vertexColor
    _baseColor *= vertexColor();
  #endif
  #endif

  FragColor.xyz = _baseColor;
 

  float _alpha = 1.0;
  #if HAS_alpha
    _alpha *= alpha();
  #endif
  #if HAS_alphaFactor
    _alpha *= alphaFactor();
  #endif


  #if alphaMode( MASK )
    if( _alpha < alphaCutoff() ) discard;
    FragColor.a = 1.0;
  #elif alphaMode( BLEND )
    FragColor.a = _alpha;
  #else
    FragColor.a = 1.0;
  #endif


  #pragma SLOT postf_linear
  #pragma SLOT postf

}