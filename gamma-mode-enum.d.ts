import Enum from "./enum";
declare enum GammaMode {
    GAMMA_NONE = 0,
    GAMMA_STD = 1,
    GAMMA_2_2 = 2,
    GAMMA_TB = 3
}
export declare type GammaModeEnum = Enum<typeof GammaMode>;
export default GammaMode;
