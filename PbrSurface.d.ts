import Chunk from "./Chunk";
import Input from "./Input";
import Enum from "./Enum";
import ChunksSlots from "./ChunksSlots";
export declare enum PbrWorkflowType {
    NONE = "NONE",
    METALNESS = "METALNESS",
    SPECULAR = "SPECULAR"
}
export declare type PbrSurface = MetalnessSurface | SpecularSurface;
export declare abstract class AbstractPbrSurface extends Chunk {
    readonly type: PbrWorkflowType;
    protected pbrInputType: Enum<readonly ["SPECULAR", "METALNESS"]>;
    constructor();
    protected _genCode(slots: ChunksSlots): void;
}
export declare class MetalnessSurface extends AbstractPbrSurface {
    readonly type: PbrWorkflowType.METALNESS;
    readonly baseColor: Input;
    readonly baseColorFactor: Input;
    readonly metalness: Input;
    readonly metalnessFactor: Input;
    readonly roughness: Input;
    readonly roughnessFactor: Input;
    constructor();
    protected _genCode(slots: ChunksSlots): void;
}
export declare class SpecularSurface extends AbstractPbrSurface {
    readonly type: PbrWorkflowType.SPECULAR;
    readonly baseColor: Input;
    readonly baseColorFactor: Input;
    readonly specular: Input;
    readonly specularFactor: Input;
    readonly glossiness: Input;
    readonly glossinessFactor: Input;
    constructor();
    protected _genCode(slots: ChunksSlots): void;
}
