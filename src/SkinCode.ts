import type { SkinAttributeSet } from "./SkinDeformer";
import type SkinDeformer from "./SkinDeformer";

import glsl from './glsl/skin.glsl'



const COMPS = ['x','y','z','w'] as const;

export const JOINTS_UNIFORM = 'uJoints'


function getAttribTypeForSize( n:1|2|3|4 ) : string {
  return n===1 ? 'float' : `vec${n}`
}


/**
 * Create glsl string to declare WEIGHT_N and JOINTS_N attributes
 */
function createAttributeDeclarations( sets : SkinAttributeSet[] ){
  let res = ''
  for (const set of sets) {
    const type = getAttribTypeForSize( set.numComponents );
    res += `
IN ${type} ${set.jointsAttrib}; 
IN ${type} ${set.weightsAttrib};`
  }
  return res;
}




function makeComputeMatrixSum( sets : SkinAttributeSet[] ) {
  const joints : string[] = []
  for (const set of sets) {
    const numcomps = set.numComponents;
    for (let i = 0; i < numcomps; i++) {
      const swizzle = (numcomps===1)?'':'.'+COMPS[i]
      const aJoint  = set.jointsAttrib+swizzle;
      const aWeight = set.weightsAttrib+swizzle;
      joints.push( `${JOINTS_UNIFORM}[int(${aJoint})] * ${aWeight}` );
    }
  }
  return joints.join('+ \n  ');
}

const SkinCode = {

  preVertexCode( skin : SkinDeformer ) : string {
    return glsl({ 
      pv: true, 
      numJoints : skin._numJoints,
      attribDecl : createAttributeDeclarations( skin._attributeSets ),
      matrixSum : makeComputeMatrixSum( skin._attributeSets ),
    });
  },
  
  vertexCode() : string {
    return glsl({ vertex_warp: true });
  }


}

export default SkinCode;