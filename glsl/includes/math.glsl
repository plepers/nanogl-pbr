#ifndef MATH_INCLUDE
#define MATH_INCLUDE 1


#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )

#endif