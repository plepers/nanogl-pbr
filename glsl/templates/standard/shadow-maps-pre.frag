

#define SHADOW_COUNT {{@shadowCount}}

#if __VERSION__ == 300
  precision lowp sampler2DShadow;

  #define DepthSampler sampler2DShadow
  
#else
  #define DepthSampler sampler2D
#endif


{{= for(var i = 0; i<obj.shadowCount; i++){ }}
  uniform DepthSampler tShadowMap{{i}};
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


#if __VERSION__ == 300
  
      
  float textureShadow( DepthSampler t, float ref, vec2 uvs ){
    return texture(t, vec3( uvs, ref ) );
  }

  vec2 textureShadow( DepthSampler t, float ref, vec4 uvs ){
    
    return vec2(
      texture(t, vec3( uvs.xy, ref ) ),
      texture(t, vec3( uvs.zw, ref ) )
    );

  }

  vec4 textureShadow( DepthSampler t, float ref, vec4 uvs0, vec4 uvs1 ){
    
    return vec4(
      texture(t, vec3( uvs0.xy, ref ) ),
      texture(t, vec3( uvs0.zw, ref ) ),
      texture(t, vec3( uvs1.xy, ref ) ),
      texture(t, vec3( uvs1.zw, ref ) )
    );

  }



#else



  #if depthFormat( D_RGB )
    float FETCH_DEPTH( DepthSampler t, vec2 uvs ){
      return decodeDepthRGB( texture2D(t,uvs).xyz );
    }
    //define FETCH_DEPTH(t,uvs) decodeDepthRGB( texture2D(t,uvs).xyz )
  #endif

  #if depthFormat( D_DEPTH )
    float FETCH_DEPTH( DepthSampler t, vec2 uvs ){
      return texture2D(t,uvs).x;
    }
    //define FETCH_DEPTH(t,uvs) texture2D(t,uvs).x
  #endif

  
  float textureShadow( DepthSampler t, float ref, vec2 uvs ){
    return step( ref, FETCH_DEPTH(t,uvs));
  }

  vec2 textureShadow( DepthSampler t, float ref, vec4 uvs ){
    
    vec2 occl = vec2(
      FETCH_DEPTH(t,uvs.xy),
      FETCH_DEPTH(t,uvs.zw)
    );

    return step( vec2(ref), occl );
  }

  vec4 textureShadow( DepthSampler t, float ref, vec4 uvs0, vec4 uvs1 ){
    
    vec4 occl = vec4(
      FETCH_DEPTH(t,uvs0.xy),
      FETCH_DEPTH(t,uvs0.zw),
      FETCH_DEPTH(t,uvs1.xy),
      FETCH_DEPTH(t,uvs1.zw)
    );

    return step( vec4(ref), occl );
  }

#endif







float resolveShadowNoFiltering(highp float fragZ, DepthSampler depth,highp vec2 uv ){
    return textureShadow( depth, fragZ, uv );
}


#if __VERSION__ == 300
  // Bilinear is natively supported in ES3
  // Shadowmap filtering must be set by sampler2DShadow filter parameter

  float resolveShadow2x1(highp float fragZ, DepthSampler depth,highp vec2 uv, vec2 mapSize ){
    return textureShadow( depth, fragZ, uv );
  }

  float resolveShadow2x2(highp float fragZ, DepthSampler depth,highp vec2 uv, vec2 mapSize ){
    return textureShadow( depth, fragZ, uv );
  }

#else

  float resolveShadow2x1(highp float fragZ, DepthSampler depth,highp vec2 uv, vec2 mapSize ){

    highp float coordsPx = uv.x*mapSize.x;
    highp float uvMin = floor( coordsPx ) * mapSize.y;
    highp float uvMax = ceil(  coordsPx ) * mapSize.y;

    vec2 occl = textureShadow( depth, fragZ, vec4(
      uvMin,uv.y,
      uvMax,uv.y
    ));

    highp float ratio = coordsPx - uvMin*mapSize.x;
    return ( ratio * occl.y + occl.x ) - ratio * occl.x;

  }

  float resolveShadow2x2(highp float fragZ, DepthSampler depth,highp vec2 uv, vec2 mapSize ){

    highp vec2 coordsPx = uv*mapSize.x;
    highp vec2 uvMin=floor( coordsPx ) *mapSize.y;
    highp vec2 uvMax=ceil(  coordsPx ) *mapSize.y;

    vec4 occl = textureShadow( depth, fragZ, 
      vec4(
        uvMin,
        vec2(uvMax.x,uvMin.y)
      ),
      vec4(
        vec2(uvMin.x,uvMax.y),
        uvMax
      )
    );

    highp vec2 ratio = coordsPx - uvMin*mapSize.x;
    vec2  t = ( ratio.y * occl.zw + occl.xy ) - ratio.y * occl.xy;

    return(ratio.x*t.y+t.x)-ratio.x*t.x;
  }

#endif


float calcLightOcclusions(DepthSampler depth, highp vec3 fragCoord, vec2 mapSize ){
  float s;

  highp vec2 kernelOffset = uShadowKernelRotation * mapSize.y;

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

    s = resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + kernelOffset                         , mapSize );
    s+= resolveShadow2x2( fragCoord.z, depth, fragCoord.xy - kernelOffset                         , mapSize );
    s+= resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x) , mapSize );
    s+= resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x) , mapSize );
    s /= 4.0;
  #endif

  // PCF2x2
  #if shadowFilter( PCF2x2 )

    s = resolveShadow2x1( fragCoord.z, depth, fragCoord.xy + kernelOffset , mapSize);
    s+= resolveShadow2x1( fragCoord.z, depth, fragCoord.xy - kernelOffset , mapSize);
    s /= 2.0;
  #endif


  return s;

}



vec3 calcShadowPosition( vec4 texelBiasVector, mat4 shadowProjection, vec3 worldPos, vec3 worldNormal, float invMapSize )
{
  float WoP = dot( texelBiasVector, vec4( worldPos, 1.0 ) );

  WoP *= .0005+2.0*invMapSize;

  highp vec4 fragCoord = shadowProjection * vec4( worldPos + WoP * worldNormal, 1.0);
  return fragCoord.xyz / fragCoord.w;
}


