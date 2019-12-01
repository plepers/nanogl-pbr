import Enum from "./enum";
declare enum ShadowFiltering {
    PCFNONE = 0,
    PCF4x1 = 1,
    PCF4x4 = 2,
    PCF2x2 = 3
}
export declare type ShadowFilteringEnum = Enum<typeof ShadowFiltering>;
export default ShadowFiltering;
