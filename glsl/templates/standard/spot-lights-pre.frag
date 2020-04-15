#define NUM_S_LIGHTS {{@count}}

{{= if(obj.count>0){ }}
uniform vec3 uLSpotPositions  [NUM_S_LIGHTS];
uniform vec3 uLSpotDirections [NUM_S_LIGHTS];
uniform vec4 uLSpotColors     [NUM_S_LIGHTS]; // rgb + iblShadowing
uniform vec4 uLSpotAttenuation[NUM_S_LIGHTS]; 
{{= } }}

