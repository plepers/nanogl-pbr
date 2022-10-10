import Enum from "./Enum";

export enum ColorSpace {
  AUTO   = 'auto',
  SRGB   = 'srgb',
  LINEAR = 'linear',
}

export const ColorSpaceList = [
  ColorSpace.SRGB,
  ColorSpace.LINEAR,
] as const

export type ColorSpaceEnum = Enum<typeof ColorSpaceList>
