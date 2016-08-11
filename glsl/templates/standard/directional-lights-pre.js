module.exports = function( obj ){
var __t,__p='';
__p+='#define NUM_D_LIGHTS '+
(obj.count)+
'\n\n';
 if(obj.count>0){ 
__p+='\nuniform vec3 uLDirDirections [NUM_D_LIGHTS];\nuniform vec4 uLDirColors     [NUM_D_LIGHTS]; // rgb + iblShadowing\n';
 } 
__p+='\n\n';
return __p;
}