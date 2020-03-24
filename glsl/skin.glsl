{{= if( obj.pv === true ){ }}

#define SKIN_NUM_JOINTS {{@numJoints}}
uniform mat4 uJoints[SKIN_NUM_JOINTS];
{{@attribDecl}}
mat4 ComputeSkinMatrix() {
  mat4 SM = {{@matrixSum}};
  return SM;
}
{{= } }}

{{= if( obj.vertex_warp === true ){ }}
  mat4 _skinMatrix = ComputeSkinMatrix();
  vertex.worldMatrix = vertex.worldMatrix * _skinMatrix;
{{= } }}
