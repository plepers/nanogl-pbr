module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_S_LIGHTS '+
(obj.count)+
'\n\n';
 if(obj.count>0){ 
__p+='\nuniform vec3 uLSpotPositions  [NUM_S_LIGHTS];\nuniform vec3 uLSpotFalloff    [NUM_S_LIGHTS];\nuniform vec2 uLSpotSpot       [NUM_S_LIGHTS];\nuniform vec3 uLSpotDirections [NUM_S_LIGHTS];\nuniform vec4 uLSpotColors     [NUM_S_LIGHTS]; // rgb + iblShadowing\n';
 } 
__p+='\n\n';
return __p;
}