



#if HAS_normal

  vec3 GetScaledNormal( vec3 normalMap, float scale ){
    vec3 nrm = normalMap = normalMap*vec3(2.0) - vec3(1.0);
    return normalize( nrm * vec3(scale, scale, 1.0 ) );
  }

  #if HAS_normalScale
    #define NormalMap(k) GetScaledNormal( normal(), normalScale() )
  #else
    #define NormalMap(k) normal()*vec3(2.0)-vec3(1.0)
  #endif

#endif


#if HAS_normal
  
  mat3 computeTangentSpaceMatrix( vec2 nrmTexCoords ){

  #if hasTangents
    return mat3( vWorldTangent, vWorldBitangent, vWorldNormal );
  #else

      vec3 pos_dx = dFdx(vWorldPosition);
      vec3 pos_dy = dFdy(vWorldPosition);
      vec2 tex_dx = dFdx(nrmTexCoords);
      vec2 tex_dy = dFdy(nrmTexCoords);

      vec3 tangent = (tex_dy.y * pos_dx - tex_dx.y * pos_dy) / (tex_dx.x * tex_dy.y - tex_dy.x * tex_dx.y);

      #if hasNormals 
        vec3 worldNormal = normalize( vWorldNormal );
      #else
        vec3 worldNormal = normalize( cross(pos_dx, pos_dy) );
      #endif
      

      tangent = normalize(tangent - worldNormal * dot(worldNormal, tangent));
      vec3 binormal = normalize(cross(worldNormal, tangent));
      return mat3(tangent, binormal, worldNormal);
  #endif
  }

  #define COMPUTE_NORMAL(k) ComputeWorldNormal( NormalMap(), normal_texCoord() )
  vec3 ComputeWorldNormal( vec3 nrmTex, vec2 nrmTexCoords ){
    mat3 tbn = computeTangentSpaceMatrix( nrmTexCoords );
    return tbn*nrmTex;
  }

#else
  #define COMPUTE_NORMAL(k) ComputeWorldNormal( )
  vec3 ComputeWorldNormal(){
    #if hasNormals 
      return normalize( gl_FrontFacing ? vWorldNormal : -vWorldNormal );
    #else
      vec3 pos_dx = dFdx(vWorldPosition);
      vec3 pos_dy = dFdy(vWorldPosition);
      return normalize( cross(pos_dx, pos_dy) );
    #endif
  }
#endif





