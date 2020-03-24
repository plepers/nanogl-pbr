import type SkinDeformer from "./SkinDeformer";
export declare const JOINTS_UNIFORM = "uJoints";
declare const SkinCode: {
    preVertexCode(skin: SkinDeformer): string;
    vertexCode(): string;
};
export default SkinCode;
