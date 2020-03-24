import type MorphDeformer from "./MorphDeformer";
export declare const WEIGHTS_UNIFORM = "uMorphWeights";
export declare type MorphAttributeType = 'float' | 'vec2' | 'vec3' | 'vec4';
export declare type MorphAttribInfos = {
    type: MorphAttributeType;
    name: string;
    attributes: string[];
};
declare const MorphCode: {
    preVertexCode(morph: MorphDeformer): string;
    vertexCode(morph: MorphDeformer): string;
};
export default MorphCode;
