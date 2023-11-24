import type MorphDeformer from "./MorphDeformer"

/** The name of the uniform that holds the weights of the morph targets. */
export const WEIGHTS_UNIFORM = 'uMorphWeights'

/** A type of morph attribute. */
export type MorphAttributeType = 'float' | 'vec2' | 'vec3' | 'vec4';
/** A name of morph attribute. */
export type MorphAttributeName = 'position' | 'normal' | 'tangent';
/**
 * The definition of a morph attribute.
 * @example
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
  /** The type of the attribute to morph */
  type : MorphAttributeType
  /** The name of the attribute to morph */
  name : MorphAttributeName
  /** The list of attributes names for the morph targets */
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


/**
 * The code for a MorphDeformer.
 */
const MorphCode = {
  /**
   * Generate the pre-vertex code for a MorphDeformer.
   * @param morph The MorphDeformer to generate the code for
   */
  preVertexCode( morph : MorphDeformer ) : string {
    return [
      declareWeights(morph.numTargets),
      declareAttributes(morph.morphInfos),
      generateMorphFunctions(morph.morphInfos)
    ].join('\n')
  },
  /**
   * Generate the vertex code for a MorphDeformer.
   * @param morph The MorphDeformer to generate the code for
   */
  vertexCode( morph : MorphDeformer ) : string {
    return generateMorphCalls(morph.morphInfos);
  }

}


export default MorphCode