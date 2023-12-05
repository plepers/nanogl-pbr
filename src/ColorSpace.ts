import Enum from "./Enum";

/** The color space modes. */
export enum ColorSpace {
  AUTO   = 'auto',
  SRGB   = 'srgb',
  LINEAR = 'linear',
}

/** The list of color space modes. */
export const ColorSpaceList = [
  ColorSpace.SRGB,
  ColorSpace.LINEAR,
] as const

/**
 * An Enum for the color space modes.
 * @resolveTypeof
 */
export type ColorSpaceEnum = Enum<typeof ColorSpaceList>
