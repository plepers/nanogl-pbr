import Enum from "./Enum";
export declare enum ColorSpace {
    AUTO = "auto",
    SRGB = "srgb",
    LINEAR = "linear"
}
export declare const ColorSpaceList: readonly [ColorSpace.SRGB, ColorSpace.LINEAR];
export declare type ColorSpaceEnum = Enum<typeof ColorSpaceList>;
