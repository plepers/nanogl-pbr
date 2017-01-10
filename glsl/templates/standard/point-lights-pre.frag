#define NUM_P_LIGHTS {{@count}}

{{= if(obj.count>0){ }}
uniform vec3 uLPointPositions  [NUM_P_LIGHTS];
uniform vec3 uLPointFalloff    [NUM_P_LIGHTS];
uniform vec3 uLPointColors     [NUM_P_LIGHTS]; // rgb
{{= } }}

