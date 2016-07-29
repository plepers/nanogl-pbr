#define NUM_D_LIGHTS {{@count}}

{{= if(obj.count>0){ }}
uniform vec3 uLDirDirections [NUM_D_LIGHTS];
uniform vec4 uLDirColors     [NUM_D_LIGHTS]; // rgb + iblShadowing
{{= } }}

