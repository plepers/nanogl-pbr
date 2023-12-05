import type MorphDeformer from "./MorphDeformer";
export declare const WEIGHTS_UNIFORM = "uMorphWeights";
export type MorphAttributeType = 'float' | 'vec2' | 'vec3' | 'vec4';
export type MorphAttributeName = 'position' | 'normal' | 'tangent';
export type MorphAttribInfos = {
    type: MorphAttributeType;
    name: MorphAttributeName;
    attributes: string[];
};
declare const MorphCode: {
    preVertexCode(morph: MorphDeformer): string;
    vertexCode(morph: MorphDeformer): string;
};
export default MorphCode;
