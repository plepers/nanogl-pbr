module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_S_LIGHTS '+
(obj.count)+
'\r\n\r\n';
 if(obj.count>0){ 
__p+='\r\nuniform vec3 uLSpotPositions  [NUM_S_LIGHTS];\r\nuniform vec3 uLSpotDirections [NUM_S_LIGHTS];\r\nuniform vec4 uLSpotColors     [NUM_S_LIGHTS]; // rgb + iblShadowing\r\nuniform vec4 uLSpotAttenuation[NUM_S_LIGHTS]; \r\n';
 } 
__p+='\r\n\r\n';
return __p;
}