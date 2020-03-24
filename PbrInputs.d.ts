import Chunk from "./Chunk";
import Input from "./Input";
import Enum from "./Enum";
import ChunksSlots from "./ChunksSlots";
export declare enum PbrWorkflowType {
    NONE = "NONE",
    METALNESS = "METALNESS",
    SPECULAR = "SPECULAR"
}
declare type PbrWorkflow = PbrInputs | MetalnessInputs | SpecularInputs;
export default class PbrSurface<T extends PbrWorkflow = PbrWorkflow> extends Chunk {
    static MetalnessSurface(): PbrSurface<MetalnessInputs>;
    static SpecularSurface(): PbrSurface<SpecularInputs>;
    protected _genCode(slots: ChunksSlots): void;
    private _inputs;
    get inputs(): T;
    constructor(inputs: T);
    setInputs(inputs: T): void;
}
export declare abstract class PbrInputs extends Chunk {
    readonly type: PbrWorkflowType;
    protected pbrInputType: Enum<readonly ["SPECULAR", "METALNESS"]>;
    constructor();
    protected _genCode(slots: ChunksSlots): void;
}
export declare class MetalnessInputs extends PbrInputs {
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
export declare class SpecularInputs extends PbrInputs {
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
export {};
