

#define SHADOW_COUNT {{@shadowCount}}

{{= for(var i = 0; i<obj.shadowCount; i++){ }}
  uniform sampler2D tShadowMap{{i}};
{{= } }}




uniform highp vec2 uShadowKernelRotation;
uniform highp mat4 uShadowMatrices[SHADOW_COUNT];
uniform highp vec4 uShadowTexelBiasVector[SHADOW_COUNT];
uniform       vec2 uShadowMapSize[SHADOW_COUNT];


// RGB depth decoding
// ------------------
highp float decodeDepthRGB(highp vec3 rgb){
  return(rgb.x+rgb.y*(1.0/255.0))+rgb.z*(1.0/65025.0);
}



#if depthFormat( D_RGB )
  #define FETCH_DEPTH(t,uvs) decodeDepthRGB( texture2D(t,uvs).xyz )
#endif

#if depthFormat( D_DEPTH )
  #define FETCH_DEPTH(t,uvs) texture2D(t,uvs).x
#endif






float resolveShadowNoFiltering(highp float fragZ, sampler2D depth,highp vec2 uv ){
    return step( fragZ, FETCH_DEPTH( depth, uv.xy ) );
}


float resolveShadow2x1(highp float fragZ, sampler2D depth,highp vec2 uv, vec2 mapSize ){

  highp float coordsPx = uv.x*mapSize.x;
  highp float uvMin = floor( coordsPx ) * mapSize.y;
  highp float uvMax = ceil(  coordsPx ) * mapSize.y;

  vec2 occl = vec2(
    FETCH_DEPTH( depth, vec2( uvMin, uv.y ) ),
    FETCH_DEPTH( depth, vec2( uvMax, uv.y ) )
  );

  occl = step( vec2(fragZ), occl );

  highp float ratio = coordsPx - uvMin*mapSize.x;
  return ( ratio * occl.y + occl.x ) - ratio * occl.x;

}

float resolveShadow2x2(highp float fragZ, sampler2D depth,highp vec2 uv, vec2 mapSize ){

  highp vec2 coordsPx = uv*mapSize.x;
  highp vec2 uvMin=floor( coordsPx ) *mapSize.y;
  highp vec2 uvMax=ceil(  coordsPx ) *mapSize.y;

  vec4 occl = vec4(
    FETCH_DEPTH( depth, uvMin ),
    FETCH_DEPTH( depth, vec2(uvMax.x,uvMin.y) ),
    FETCH_DEPTH( depth, vec2(uvMin.x,uvMax.y) ),
    FETCH_DEPTH( depth, uvMax )
  );

  occl = step( vec4(fragZ), occl );

  highp vec2 ratio = coordsPx - uvMin*mapSize.x;
  vec2  t = ( ratio.y * occl.zw + occl.xy ) - ratio.y * occl.xy;

  return(ratio.x*t.y+t.x)-ratio.x*t.x;
}


float calcLightOcclusions(sampler2D depth, highp vec3 fragCoord, vec2 mapSize ){
  float s;

  highp vec2 kernelOffset = uShadowKernelRotation * ( 4.0 / mapSize.x );

  // NO FILTER
  #if shadowFilter( PCFNONE )

    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy );
  #endif

  // PCF4x1
  #if shadowFilter( PCF4x1 )

    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + kernelOffset                    );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy - kernelOffset                    );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x)  );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x)  );
    s /= 4.0;
  #endif

  // PCF4x4
  #if shadowFilter( PCF4x4 )

    s = resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + kernelOffset                        , mapSize );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy - kernelOffset                         , mapSize );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x) , mapSize );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x) , mapSize );
    s /= 4.0;
  #endif

  // PCF2x2
  #if shadowFilter( PCF2x2 )
  
    s = resolveShadow2x1( fragCoord.z, depth, fragCoord.xy + kernelOffset , mapSize);
    s +=resolveShadow2x1( fragCoord.z, depth, fragCoord.xy - kernelOffset , mapSize);
    s /= 2.0;
  #endif


  return s;

}



vec3 calcShadowPosition( vec4 texelBiasVector, mat4 shadowProjection, vec3 worldNormal, float invMapSize )
{
  float WoP = dot( texelBiasVector, vec4( vWorldPosition, 1.0 ) );

  WoP *= .0005+2.0*invMapSize;

  highp vec4 fragCoord = shadowProjection * vec4( vWorldPosition + WoP * worldNormal, 1.0);
  return fragCoord.xyz / fragCoord.w;
}


