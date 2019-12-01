import Enum from "./enum";
declare enum DepthFormat {
    D_RGB = 0,
    D_DEPTH = 1
}
export declare type DepthFormatEnum = Enum<typeof DepthFormat>;
export default DepthFormat;
