module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_P_LIGHTS '+
(obj.count)+
'\n\n';
 if(obj.count>0){ 
__p+='\nuniform vec4 uLPointPositions  [NUM_P_LIGHTS]; //w is radius\nuniform vec3 uLPointFalloff    [NUM_P_LIGHTS];\nuniform vec3 uLPointColors     [NUM_P_LIGHTS]; // rgb\n';
 } 
__p+='\n\n';
return __p;
}