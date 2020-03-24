import glsl from './glsl/skin.glsl';
const COMPS = ['x', 'y', 'z', 'w'];
export const JOINTS_UNIFORM = 'uJoints';
function getAttribTypeForSize(n) {
    return n === 1 ? 'float' : `vec${n}`;
}
function createAttributeDeclarations(sets) {
    let res = '';
    for (const set of sets) {
        const type = getAttribTypeForSize(set.numComponents);
        res += `
IN ${type} ${set.jointsAttrib}; 
IN ${type} ${set.weightsAttrib};`;
    }
    return res;
}
function makeComputeMatrixSum(sets) {
    const joints = [];
    for (const set of sets) {
        const numcomps = set.numComponents;
        for (let i = 0; i < numcomps; i++) {
            const swizzle = (numcomps === 1) ? '' : '.' + COMPS[i];
            const aJoint = set.jointsAttrib + swizzle;
            const aWeight = set.weightsAttrib + swizzle;
            joints.push(`${JOINTS_UNIFORM}[int(${aJoint})] * ${aWeight}`);
        }
    }
    return joints.join('+ \n  ');
}
const SkinCode = {
    preVertexCode(skin) {
        return glsl({
            pv: true,
            numJoints: skin._numJoints,
            attribDecl: createAttributeDeclarations(skin._attributeSets),
            matrixSum: makeComputeMatrixSum(skin._attributeSets),
        });
    },
    vertexCode() {
        return glsl({ vertex_warp: true });
    }
};
export default SkinCode;
