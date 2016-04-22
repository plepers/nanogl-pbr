
#define QUALITY_SHADOWMAP_SIZE 1024.0
#define SHADOW_KERNEL (4.0 / QUALITY_SHADOWMAP_SIZE )
#define SHADOW_COUNT {{shadowCount}}

{{= for(var i = 0; i<obj.shadowCount; i++){ }}
  uniform sampler2D tShadowMap{{i}};
{{= } }}




uniform highp vec2 uShadowKernelRotation;
uniform highp vec4 uShadowMapSize;
uniform highp mat4 uShadowMatrices[SHADOW_COUNT];
uniform highp vec4 uShadowTexelBiasVector[SHADOW_COUNT];


highp float decodeDepthRGB(highp vec3 rgb){
  return(rgb.x+rgb.y*(1.0/255.0))+rgb.z*(1.0/65025.0);
}



float resolveShadowNoFiltering(highp float fragZ, sampler2D depth,highp vec2 uv ){
    return step( fragZ, decodeDepthRGB(texture2D(depth,uv.xy).xyz) );
}


float resolveShadow2x1(highp float fragZ, sampler2D depth,highp vec2 uv ){

  highp float coordsPx = uv.x*uShadowMapSize.x;
  highp float uvMin = floor( coordsPx ) * uShadowMapSize.z;
  highp float uvMax = ceil(  coordsPx ) * uShadowMapSize.z;

  vec2 occl = vec2(
    decodeDepthRGB(texture2D(depth,vec2( uvMin, uv.y )).xyz),
    decodeDepthRGB(texture2D(depth,vec2( uvMax, uv.y )).xyz)
  );

  occl = step( vec2(fragZ), occl );

  highp float ratio = coordsPx - uvMin*uShadowMapSize.x;
  return ( ratio * occl.y + occl.x ) - ratio * occl.x;

}

float resolveShadow2x2(highp float fragZ, sampler2D depth,highp vec2 uv ){

  highp vec2 coordsPx = uv*uShadowMapSize.xy;
  highp vec2 uvMin=floor( coordsPx ) *uShadowMapSize.zw;
  highp vec2 uvMax=ceil(  coordsPx ) *uShadowMapSize.zw;

  vec4 occl = vec4(
    decodeDepthRGB(texture2D(depth,uvMin).xyz),
    decodeDepthRGB(texture2D(depth,vec2(uvMax.x,uvMin.y)).xyz),
    decodeDepthRGB(texture2D(depth,vec2(uvMin.x,uvMax.y)).xyz),
    decodeDepthRGB(texture2D(depth,uvMax).xyz)
  );

  occl = step( vec4(fragZ), occl );

  highp vec2 ratio = coordsPx - uvMin*uShadowMapSize.xy;
  vec2  t = ( ratio.y * occl.zw + occl.xy ) - ratio.y * occl.xy;

  return(ratio.x*t.y+t.x)-ratio.x*t.x;
}


float calcLightOcclusions(sampler2D depth, highp vec3 fragCoord, highp vec2 kernelOffset){
  float s;

  // NO FILTER
  #if QUALITY_SHADOWS == 1
    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy );


  // PCF4x1
  #elif QUALITY_SHADOWS == 2

    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + kernelOffset                    );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy - kernelOffset                    );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x)  );
    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x)  );
    s /= 4.0;

  // PCF4x4
  #elif QUALITY_SHADOWS == 3

    s = resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + kernelOffset                    );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy - kernelOffset                    );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x)  );
    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x)  );
    s /= 4.0;

  // PCF2x2
  #elif QUALITY_SHADOWS == 4

    s = resolveShadow2x1( fragCoord.z, depth, fragCoord.xy + kernelOffset );
    s +=resolveShadow2x1( fragCoord.z, depth, fragCoord.xy - kernelOffset );
    s /= 2.0;

  #endif

  return s;

}


struct LightOcclusions{
  float weights[LIGHT_COUNT];
};

vec3 calcShadowPosition( vec4 texelBiasVector, mat4 shadowProjection, vec3 worldNormal, float samplesDelta )
{
  float WoP = dot( texelBiasVector, vec4( vWorldPosition, 1.0 ) );

  WoP *= .0005+0.5*samplesDelta;

  highp vec4 fragCoord = shadowProjection * vec4( vWorldPosition + WoP * worldNormal, 1.0);
  return fragCoord.xyz / fragCoord.w;
}


void resolveLightOcclusion(out LightOcclusions ss,float samplesDelta)
{
  highp vec3 fragCoord;

  vec3 worldNormal = gl_FrontFacing ? vWorldNormal : -vWorldNormal;

  highp vec2 kernelOffset = uShadowKernelRotation * samplesDelta;

  #if SHADOW_COUNT > 0
    fragCoord = calcShadowPosition( uShadowTexelBiasVector[0], uShadowMatrices[0] , worldNormal, samplesDelta );
    ss.weights[0] = calcLightOcclusions(tShadowMap0,fragCoord,kernelOffset);
  #endif

  #if SHADOW_COUNT > 1
    fragCoord = calcShadowPosition( uShadowTexelBiasVector[1], uShadowMatrices[1] , worldNormal, samplesDelta );
    ss.weights[1] = calcLightOcclusions(tShadowMap1,fragCoord,kernelOffset);
  #endif

  #if SHADOW_COUNT > 2
    fragCoord = calcShadowPosition( uShadowTexelBiasVector[2], uShadowMatrices[2] , worldNormal, samplesDelta );
    ss.weights[2] = calcLightOcclusions(tShadowMap2,fragCoord,kernelOffset);
  #endif

  for(int o=SHADOW_COUNT; o<LIGHT_COUNT; ++o){
    ss.weights[o]=1.0;
  }

}

#endif
