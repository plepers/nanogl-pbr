import type MorphDeformer from "./MorphDeformer"

export const WEIGHTS_UNIFORM = 'uMorphWeights'


export type MorphAttributeType = 'float' | 'vec2' | 'vec3' | 'vec4';
export type MorphAttributeName = 'position' | 'normal' | 'tangent';
/**
 * {
 *    type:  'vec3'
 *    name : 'position'
 *    attributes : [
 *      'aPosition_morph0',
 *      'aPosition_morph1',
 *      'aPosition_morph2'
 *    ]
 * }
 */
export type MorphAttribInfos = {
  type : MorphAttributeType
  name : MorphAttributeName
  attributes : string[]
}


/**
 *  IN vec3 aPosition_morph0;
 *  IN vec3 aPosition_morph1;
 *  IN vec3 aPosition_morph2;
 */
function declareAttribute( infos : MorphAttribInfos ) : string {
  return infos.attributes.map((attrib:string, i:number)=>{
    return `IN ${infos.type} ${attrib};`
  }).join('\n')
}


/**
 * 
 * void MorphAttribute_position( inout vec3 position ) {
 *   position +=
 *     aPosition_morph0 * uMorphWeights[0] +
 *     aPosition_morph1 * uMorphWeights[1] +
 *     aPosition_morph2 * uMorphWeights[2];
 * }
 */
function generateMorphFunction( infos : MorphAttribInfos ) : string {

  const morphMix = infos.attributes.map((attrib:string, i:number)=>{
    return `${attrib} * ${WEIGHTS_UNIFORM}[${i}]`
  }).join(' +\n ')

  return `void MorphAttribute_${infos.name}( inout ${infos.type} ${infos.name} ){
    ${infos.name} += ${morphMix};
  }`

}


function generateMorphCall( infos : MorphAttribInfos ) : string {
  return `MorphAttribute_${infos.name}( vertex.${infos.name} );`
}


function declareAttributes( infos : MorphAttribInfos[] ) : string {
  return infos.map( declareAttribute ).join('\n')
}

function generateMorphFunctions( infos : MorphAttribInfos[] ) : string {
  return infos.map( generateMorphFunction ).join('\n')
}

function generateMorphCalls( infos : MorphAttribInfos[] ) : string {
  return infos.map( generateMorphCall ).join('\n')
}



function declareWeights( numtgt : number ) : string {
  return `uniform float ${WEIGHTS_UNIFORM}[${numtgt}];`
}



const MorphCode = {
  preVertexCode( morph : MorphDeformer ) : string {
    return [
      declareWeights(morph.numTargets),
      declareAttributes(morph.morphInfos),
      generateMorphFunctions(morph.morphInfos)
    ].join('\n')
  },
  
  vertexCode( morph : MorphDeformer ) : string {
    return generateMorphCalls(morph.morphInfos);
  }

}


export default MorphCode