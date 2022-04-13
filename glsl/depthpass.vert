
#pragma SLOT version

#pragma SLOT definitions


#ifndef hasNormals
  #define hasNormals 1
#endif 
#ifndef hasTangents
  #define hasTangents hasNormals
#endif 

#if hasTangents && !hasNormals 
  #pragma error tan but no nrm
  error
#endif

#pragma SLOT precision

{{ require( "./includes/glsl-compat.vert" )() }}

#pragma SLOT pv


IN vec3 aPosition;


// uniform mat4 uMVP;
uniform mat4 uWorldMatrix;
uniform mat4 uVP;


#if depthFormat( D_RGB )
  OUT vec2 fragZW;
#endif


struct VertexData {
  highp vec3 position;
  highp vec3 worldPos;
  #if hasNormals
    vec3 normal;
  #endif
  #if hasTangents
    vec3 tangent;
  #endif
  mat4 worldMatrix;
};


void InitVertexData( out VertexData vertex ){

  vertex.position = aPosition;
  #if hasNormals
    vertex.normal = vec3(0.0);
  #endif
  #if hasTangents
    vertex.tangent = vec3(0.0);
  #endif

  vertex.worldMatrix = uWorldMatrix;
   
}



void main( void ){

  #pragma SLOT v

  VertexData vertex;
  InitVertexData( vertex );

  #pragma SLOT vertex_warp

  vec4 worldPos = vertex.worldMatrix * vec4( vertex.position, 1.0 );
  vertex.worldPos.xyz = worldPos.xyz / worldPos.w;

  #pragma SLOT vertex_warp_world

  gl_Position     = uVP * vec4( vertex.worldPos, 1.0 );

  #if depthFormat( D_RGB )
    fragZW=gl_Position.zw;
  #endif

  #pragma SLOT postv

}
