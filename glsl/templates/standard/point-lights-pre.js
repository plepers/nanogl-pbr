module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_P_LIGHTS '+
(obj.count)+
'\r\n\r\n';
 if(obj.count>0){ 
__p+='\r\nuniform vec4 uLPointPositions  [NUM_P_LIGHTS]; //w is radius\r\nuniform vec3 uLPointFalloff    [NUM_P_LIGHTS];\r\nuniform vec3 uLPointColors     [NUM_P_LIGHTS]; // rgb\r\n';
 } 
__p+='\r\n\r\n';
return __p;
}