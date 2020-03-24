export const WEIGHTS_UNIFORM = 'uMorphWeights';
function declareAttribute(infos) {
    return infos.attributes.map((attrib, i) => {
        return `IN ${infos.type} ${attrib};`;
    }).join('\n');
}
function generateMorphFunction(infos) {
    const morphMix = infos.attributes.map((attrib, i) => {
        return `${attrib} * ${WEIGHTS_UNIFORM}[${i}]`;
    }).join(' +\n ');
    return `void MorphAttribute_${infos.name}( inout ${infos.type} ${infos.name} ){
    ${infos.name} += ${morphMix};
  }`;
}
function generateMorphCall(infos) {
    return `MorphAttribute_${infos.name}( ${infos.name} );`;
}
function declareAttributes(infos) {
    return infos.map(declareAttribute).join('\n');
}
function generateMorphFunctions(infos) {
    return infos.map(generateMorphFunction).join('\n');
}
function generateMorphCalls(infos) {
    return infos.map(generateMorphCall).join('\n');
}
function declareWeights(numtgt) {
    return `uniform float ${WEIGHTS_UNIFORM}[${numtgt}];`;
}
const MorphCode = {
    preVertexCode(morph) {
        return [
            declareWeights(morph.numTargets),
            declareAttributes(morph.morphInfos),
            generateMorphFunctions(morph.morphInfos)
        ].join('\n');
    },
    vertexCode(morph) {
        return generateMorphCalls(morph.morphInfos);
    }
};
export default MorphCode;
