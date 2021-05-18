module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_D_LIGHTS '+
(obj.count)+
'\r\n\r\n';
 if(obj.count>0){ 
__p+='\r\nuniform vec3 uLDirDirections [NUM_D_LIGHTS];\r\nuniform vec4 uLDirColors     [NUM_D_LIGHTS]; // rgb + iblShadowing\r\n';
 } 
__p+='\r\n\r\n';
return __p;
}